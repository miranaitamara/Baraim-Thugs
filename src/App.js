import React from 'react';
import './App.css';
import { Button, Card, Container, Row, Col, ListGroup, Navbar, Nav, Form, FormControl } from 'react-bootstrap';
import moment from "moment"

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      movies: [],
      pageNo: 1,
      value: '',
    }
  }

  componentDidMount() {
    this.getMoviesData();
  }

  getMoviesData = async () => {
    const { pageNo } = this.state
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=58049738a0f581e94fda3c41ab528a79&page=${pageNo}`

    try {
      let data = await fetch(url);
      let response = await data.json();

      this.setState({
        movies: this.state.movies.concat(response.results),
        allMovie: response.results,
        pageNo: pageNo + 1,
      })

    } catch (error) {
      alert(error);
    }
  }

  handleChange = (event) => {
    this.setState({
      value: event.target.value,
    })
  }

  handleSubmit = (event) => {
    const filterMovies = this.state.allMovie.filter(movie =>
      movie.title.concat(movie.overview).toLowerCase().includes(this.state.value.toLowerCase()));

    this.setState({
      movies: filterMovies,
    })
    event.preventDefault()
  }



  sortByAZ = () => {

    function compare(a, b) {
      if (a.title < b.title) {
        return -1;
      } if (a.title > b.title) {
        return 1;
      }
      return 0;
    }

    const sortedMovies = this.state.movies.sort(compare);

    this.setState({
      movies: sortedMovies,
    })
  }

  sortByRating = () => {

    function compare(a, b) {
      if (a.vote_average < b.vote_average) {
        return 1;
      } if (a.vote_average > b.vote_average) {
        return -1;
      }
      return 0;
    }

    const sortedMovies = this.state.movies.sort(compare);

    this.setState({
      movies: sortedMovies,
    })
  }

  sortByVotes = () => {

    function compare(a, b) {
      if (a.vote_count < b.vote_count) {
        return 1;
      } if (a.vote_count > b.vote_count) {
        return -1;
      }
      return 0;
    }

    const sortedMovies = this.state.movies.sort(compare);

    this.setState({
      movies: sortedMovies,
    })
  }

  modifyImgUrl(path) {
    if (path === null) return "https://files.slack.com/files-pri/TG5NN1V8U-FK42LPB5E/noposter.jpg";
    return `https://image.tmdb.org/t/p/w500/${path}`;
  }

  renderMovies() {
    return (
      this.state.movies.map(({ title, overview, vote_average, backdrop_path, release_date, vote_count }) => {
        return (
          <Col md={4} className="d-flex justify-content-space-between">
            <Card style={{ marginBottom: 10 }}>
              <Card.Img variant="top" src={this.modifyImgUrl(backdrop_path)} />
              <Card.Body>
                <Card.Title style={{ textAlign: "center", fontSize: 24, height: '3rem' }}>{title}</Card.Title>
                <Card.Text style={{ textAlign: "center" }}>
                  <ListGroup variant="flush" style={{ color: "#040F16" }}>
                    <ListGroup.Item className="over-flow" style={{ height: '15rem' }}>{overview}</ListGroup.Item>
                    <ListGroup.Item><b>Release Date:</b> {moment(release_date).format("MMM Do YY")}</ListGroup.Item>
                    <ListGroup.Item><b>Vote Count:</b> {vote_count}</ListGroup.Item>
                    <ListGroup.Item className="text-center"><label className="btn text-white" style={{ backgroundColor: "#0094C6" }}>Rating: {vote_average}</label>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        )
      })
    )
  }

  renderNavBar() {
    return (
      <div>
        <Navbar style={{ backgroundColor: "#000022" }} >
          <Navbar.Brand href="#">
            <img
              alt="logo"
              src=""
              width="150"
              height="50"
              className="d-inline-block align-top"
            />
          </Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link className="text-white" onClick={this.getMoviesData}>Latest Movies</Nav.Link>
            <Nav.Link className="text-white" onClick={this.sortByRating}>Highest Rating</Nav.Link>
            <Nav.Link className="text-white" onClick={this.sortByVotes}>Highest Votes</Nav.Link>
            <Nav.Link className="text-white" onClick={this.sortByAZ}>Movies A-Z</Nav.Link>
          </Nav>
          <Form inline onSubmit={this.handleSubmit} >
            <FormControl id="searchInput" type="text" placeholder="Search" value={this.state.value} onChange={this.handleChange} className="mr-sm-2" />
            <Button variant="outline-info" onClick={this.handleSubmit} style={{ marginRight: "1rem" }}>Search</Button>
          </Form>
        </Navbar>
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderNavBar()}
        <Container>
          <Row>
            {this.renderMovies()}
          </Row>
          <Row>
            <Col className="d-flex justify-content-center">
              <Button block style={{ backgroundColor: "#005E7C" }} onChange={this.getMoviesData}>View More</Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App