import React, { Component } from "react";
import { connect } from "react-redux";
import { Image, Segment, Header, Divider, Grid, Button, Card, Icon } from "semantic-ui-react";
import { toastr } from "react-redux-toastr";
import { compose } from "redux";
import { firestoreConnect } from "react-redux-firebase";
import Dropzone from "react-dropzone";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { uploadProfileImage, deletePhoto, setMainPhoto } from "../userActions";

const query = ({ auth }) => {
  return [
    {
      collection: "users",
      doc: auth.uid,
      subcollections: [{ collection: "photos" }],
      storeAs: "photos"
    }
  ];
};

const baseStyle = {
  width: 200,
  height: 200,
  borderWidth: 2,
  borderColor: "#666",
  borderStyle: "dashed",
  borderRadius: 5
};
const activeStyle = {
  borderStyle: "solid",
  borderColor: "#6c6",
  backgroundColor: "#eee"
};
const rejectStyle = {
  borderStyle: "solid",
  borderColor: "#c66",
  backgroundColor: "#eee"
};

class PhotosPage extends Component {
  state = {
    files: [],
    fileName: "",
    cropResult: null,
    image: {}
  };

  uploadImage = async () => {
    try {
      await this.props.uploadProfileImage(
        this.state.image,
        this.state.fileName,
        this.props.firestore
      );
      this.cancelCrop();
      toastr.success("Success!", "Photo has been uploaded");
    } catch (error) {
      toastr.error("Oops", error.message);
    }
  };

  handleSetMainPhoto = photo => async () => {
    try {
      this.props.setMainPhoto(photo);
    } catch (error) {
      toastr.error("Oops", error.message);
    }
  };

  handlePhotoDelete = photo => async () => {
    try {
      this.props.deletePhoto(photo, this.props.firestore);
    } catch (error) {
      toastr.error("Oops", error.message);
    }
  };

  cancelCrop = () => {
    this.setState({
      files: [],
      image: {}
    });
  };

  cropImage = () => {
    if (typeof this.refs.cropper.getCroppedCanvas() === "undefined") {
      return;
    }

    this.refs.cropper.getCroppedCanvas().toBlob(blob => {
      let imageUrl = URL.createObjectURL(blob);
      this.setState({
        cropResult: imageUrl,
        image: blob
      });
    }, "image/jpeg");
  };

  onDrop = files => {
    if (files.length !== 0) {
      this.setState({
        fileName: files[0].name,
        files: files.map(file =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      });
    }
  };

  componentWillUnmount() {
    // Make sure to revoke the data uris to avoid memory leaks
    this.state.files.forEach(file => URL.revokeObjectURL(file.preview));
  }

  render() {
    const { photos, profile, loading } = this.props;
    let filteredPhotos;

    if (photos) {
      filteredPhotos = photos.filter(photo => {
        return photo.url !== profile.photoURL;
      });
    }

    return (
      <Segment>
        <Header dividing size="large" content="Your Photos" />
        <Grid>
          <Grid.Row />
          <Grid.Column width={4}>
            <Header color="teal" sub content="Step 1 - Add Photo" />
            <Dropzone accept="image/*" onDrop={this.onDrop} multiple={false}>
              {({
                getRootProps,
                getInputProps,
                isDragActive,
                isDragAccept,
                isDragReject,
                acceptedFiles,
                rejectedFiles
              }) => {
                let styles = { ...baseStyle };
                styles = isDragActive ? { ...styles, ...activeStyle } : styles;
                styles = isDragReject ? { ...styles, ...rejectStyle } : styles;

                return (
                  <div {...getRootProps()} style={styles}>
                    <input {...getInputProps()} />
                    <div style={{ paddingTop: "30px", textAlign: "center" }}>
                      <Icon name="upload" size="huge" />
                      <br />
                      {isDragAccept ? "Drop" : "Drag"} files here... or click to add
                    </div>
                    {isDragReject && <div>Unsupported file type...</div>}
                  </div>
                );
              }}
            </Dropzone>
          </Grid.Column>
          <Grid.Column width={1} />
          <Grid.Column width={4}>
            <Header sub color="teal" content="Step 2 - Resize image" />
            {this.state.files[0] && (
              <Cropper
                style={{ height: 200, width: "100%" }}
                ref="cropper"
                src={this.state.files[0].preview}
                aspectRatio={1}
                viewMode={0}
                dragMode="move"
                guides={false}
                scalable={true}
                cropBoxMovable={true}
                cropBoxResizable={true}
                crop={this.cropImage}
              />
            )}
          </Grid.Column>
          <Grid.Column width={1} />
          <Grid.Column width={4}>
            <Header sub color="teal" content="Step 3 - Preview and Upload" />
            {this.state.files[0] && (
              <div>
                <Image
                  style={{ minHeigth: "200px", minWidth: "200px" }}
                  src={this.state.cropResult}
                />
                <Button.Group>
                  <Button
                    loading={loading}
                    onClick={this.uploadImage}
                    style={{ width: "100px" }}
                    positive
                    icon="check"
                  />
                  <Button
                    disabled={loading}
                    onClick={this.cancelCrop}
                    style={{ width: "100px" }}
                    icon="close"
                  />
                </Button.Group>
              </div>
            )}
          </Grid.Column>
        </Grid>
        <Divider />
        <Header sub color="teal" content="All Photos" />
        <Card.Group itemsPerRow={5}>
          <Card>
            <Image src={profile.photoURL || "/assets/user.png"} />
            <Button positive>Main Photo</Button>
          </Card>
          {photos &&
            filteredPhotos.map(photo => (
              <Card key={photo.id}>
                <Image src={photo.url} />
                <div className="ui two buttons">
                  <Button
                    loading={loading}
                    onClick={this.handleSetMainPhoto(photo)}
                    basic
                    color="green"
                  >
                    Main
                  </Button>
                  <Button onClick={this.handlePhotoDelete(photo)} basic icon="trash" color="red" />
                </div>
              </Card>
            ))}
        </Card.Group>
      </Segment>
    );
  }
}

const actions = {
  uploadProfileImage,
  deletePhoto,
  setMainPhoto
};

const mapStateToProps = state => ({
  auth: state.firebase.auth,
  profile: state.firebase.profile,
  photos: state.firestore.ordered.photos,
  loading: state.async.loading
});

export default compose(
  connect(
    mapStateToProps,
    actions
  ),
  firestoreConnect(auth => query(auth))
)(PhotosPage);
