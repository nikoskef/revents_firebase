/*global google*/
import React, { Component } from "react";
import { connect } from "react-redux";
import { reduxForm, Field } from "redux-form";
import { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import Script from "react-load-script";
import { combineValidators, composeValidators, isRequired, hasLengthGreaterThan } from "revalidate";
import { withFirestore } from "react-redux-firebase";
import { Segment, Form, Button, Grid, Header } from "semantic-ui-react";
import { createEvent, updateEvent, cancelToggle } from "../eventActions";
import TextInput from "../../../app/common/form/TextInput";
import TextArea from "../../../app/common/form/TextArea";
import SelectInput from "../../../app/common/form/SelectInput";
import DateInput from "../../../app/common/form/DateInput";
import PlaceInput from "../../../app/common/form/PlaceInput";

const category = [
  { key: "drinks", text: "Drinks", value: "drinks" },
  { key: "culture", text: "Culture", value: "culture" },
  { key: "film", text: "Film", value: "film" },
  { key: "food", text: "Food", value: "food" },
  { key: "music", text: "Music", value: "music" },
  { key: "travel", text: "Travel", value: "travel" }
];

const validate = combineValidators({
  title: isRequired({ message: "The event title is required" }),
  category: isRequired({ message: "Category title is required" }),
  description: composeValidators(
    isRequired({ message: "Description is required" }),
    hasLengthGreaterThan(4)({ message: "Description needs to be at least 5 characters" })
  )(),
  city: isRequired("city"),
  venue: isRequired("venue"),
  date: isRequired("date")
});

class EventForm extends Component {
  state = {
    cityLatLng: {},
    venueLatLng: {},
    scriptLoaded: false
  };

  async componentDidMount() {
    const { firestore, match } = this.props;
    if (match.params.id) {
      await firestore.setListener(`events/${match.params.id}`);
    }
  }

  async componentWillUnmount() {
    const { firestore, match } = this.props;
    await firestore.unsetListener(`events/${match.params.id}`);
  }

  handleScriptLoaded = () => this.setState({ scriptLoaded: true });

  handleCitySelect = async selectedCity => {
    const result = await geocodeByAddress(selectedCity);
    const latlng = await getLatLng(result[0]);
    await this.setState({
      cityLatLng: latlng
    });
    await this.props.change("city", selectedCity);
  };

  handleVenueSelect = async selectedVenue => {
    const result = await geocodeByAddress(selectedVenue);
    const latlng = await getLatLng(result[0]);
    await this.setState({
      venueLatLng: latlng
    });
    await this.props.change("venue", selectedVenue);
  };

  onFormSubmit = async values => {
    values.venueLatLng = this.state.venueLatLng;
    if (this.props.initialValues.id) {
      if (Object.keys(values.venueLatLng).length === 0) {
        values.venueLatLng = this.props.event.venueLatLng;
      }
      await this.props.updateEvent(values);
      this.props.history.goBack();
    } else {
      this.props.createEvent(values, this.props.firestore);
      this.props.history.push("/events");
    }
  };

  render() {
    const { loading, invalid, submitting, pristine, event, cancelToggle } = this.props;
    return (
      <Grid>
        <Script
          url={`https://maps.googleapis.com/maps/api/js?key=${
            process.env.REACT_APP_GOOGLE_API
          }&libraries=places`}
          onLoad={this.handleScriptLoaded}
        />
        <Grid.Column mobile={16} tablet={12} computer={10}>
          <Segment>
            <Header sub color="teal" content="Event Details" />
            <Form onSubmit={this.props.handleSubmit(this.onFormSubmit)}>
              <Field
                name="title"
                type="text"
                component={TextInput}
                placeholder="Give your event a name"
              />
              <Field
                name="category"
                type="text"
                component={SelectInput}
                options={category}
                placeholder="What is your event about"
              />
              <Field
                name="description"
                type="text"
                rows={3}
                component={TextArea}
                placeholder="Tell us about your event"
              />
              <Header sub color="teal" content="Event Location Details" />

              <Field
                name="city"
                type="text"
                component={PlaceInput}
                options={{ types: ["(cities)"] }}
                placeholder="Event City"
                onSelect={this.handleCitySelect}
              />

              {this.state.scriptLoaded && (
                <Field
                  name="venue"
                  type="text"
                  component={PlaceInput}
                  options={{
                    types: ["establishment"],
                    location: new google.maps.LatLng(this.state.cityLatLng),
                    radius: 500
                  }}
                  placeholder="Event Venue"
                  onSelect={this.handleVenueSelect}
                />
              )}
              <Field
                name="date"
                type="date"
                component={DateInput}
                showTimeSelect
                timeFormat="HH:mm"
                dateFormat="MM/dd/yyyy HH:mm"
                placeholder="Date and time of event"
                timeCaption="time"
              />

              <Button
                loading={loading}
                disabled={invalid || submitting || pristine}
                positive
                type="submit"
              >
                Submit
              </Button>
              <Button disabled={loading} onClick={this.props.history.goBack} type="button">
                Cancel
              </Button>
              {event.id && (
                <Button
                  onClick={() => cancelToggle(!event.cancelled, event.id, this.props.firestore)}
                  type="button"
                  color={event.cancelled ? "green" : "red"}
                  floated="right"
                  content={event.cancelled ? "Reactivate Event" : "Cancel event"}
                />
              )}
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  let event = {};
  const eventId = ownProps.match.params.id;

  if (state.firestore.ordered.events && state.firestore.ordered.events[0]) {
    event = state.firestore.ordered.events.find(event => event.id === eventId);
  }

  if (event === undefined) {
    event = {};
  }

  // if (state.firestore.ordered.events && state.firestore.ordered.events[0]) {
  //   event = state.firestore.ordered.events[0];
  // }

  return {
    initialValues: event,
    event,
    loading: state.async.loading
  };
};

const actions = {
  createEvent,
  updateEvent,
  cancelToggle
};

export default withFirestore(
  connect(
    mapStateToProps,
    actions
  )(reduxForm({ form: "eventForm", enableReinitialize: true, validate })(EventForm))
);
