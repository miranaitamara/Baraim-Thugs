import React from 'react';
import './App.css';
import {
  Button,
  Card,
  Container,
  Row,
  Col,
  ListGroup,
  Navbar,
  Nav,
  Fade,
  Form,
  FormControl,
  Carousel,
}
  from 'react-bootstrap';
import moment from 'moment';
import { RingLoader } from 'react-spinners';
import InputRange from 'react-input-range';
import Modal from 'react-modal';
import YouTube from '@u-wave/react-youtube';
import 'react-input-range/lib/css/index.css';
import { thisExpression } from '@babel/types';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      movies: [],
      pageNo: 1,
      totalPages: null,
      scrolling: false,
      searchText: '',
      isLoading: true,
      year: { min: 1990, max: 2019 },
      rating: { min: 0, max: 10 },
      sliderShown: false,
      isOpen: false,
      selectedMovieId: null,
      // moviesGenresArray: [],
      // moviesGenres: "",
    }
  }

  componentDidMount() {
    this.getLatestMoviesData();
    this.scrollListener = window.addEventListener("scroll", e => {
      this.handleScroll(e)
    })
  }

  getLatestMoviesData = async () => {
    const { pageNo } = this.state
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=58049738a0f581e94fda3c41ab528a79&page=${pageNo}`

    try {
      let data = await fetch(url);
      let response = await data.json();

      this.setState({
        movies: this.state.movies.concat(response.results),
        allMovies: this.state.movies.concat(response.results),
        isLoading: false,
        totalPages: response.total_pages,
        scrolling: false,
      })

    } catch (error) {
      alert(error);
    }
  }

  loadMore = () => {
    this.setState({
      pageNo: this.state.pageNo + 1,
      scrolling: true,
    }, this.getLatestMoviesData)
  }

  handleScroll = e => {
    const { scrolling, totalPages, pageNo } = this.state
    if (scrolling) return
    if (totalPages <= pageNo) return

    const lastCol = document.querySelector("div.movies-cards > div:last-child")
    const lastColOffset = lastCol.offsetTop + lastCol.clientHeight
    const pageOffset = window.pageYOffset + window.innerHeight
    let bottomOffset = 20

    if (pageOffset > lastColOffset - bottomOffset) this.loadMore()
  }

  handleSearchChange = (e) => {
    this.setState({
      searchText: e.target.value,
    })
  }

  handleSearchClick = (e) => {
    const filterMovies = this.state.allMovies.filter(movie =>
      movie.title.concat(movie.overview).toLowerCase().includes(this.state.searchText.toLowerCase()));

    if (this.state.searchText === "") {
      return this.setState({
        allMovies: this.state.movies,
        movies: this.state.allMovies,
        scrolling: false,
      })
    }
    this.setState({
      movies: filterMovies,
      scrolling: true,
    })
    e.preventDefault()
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

    const sortedMovies = this.state.allMovies.sort(compare);

    this.setState({
      movies: sortedMovies,
    })
  }

  sortByVotes = () => {
    const sortedMovies = this.state.allMovies.sort((a, b) => b.vote_count - a.vote_count);

    this.setState({
      movies: sortedMovies,
    })
  }

  sortByRating = () => {
    const results = this.state.allMovies.filter(movie => {
      if (movie.vote_average >= this.state.rating.min && movie.vote_average <= this.state.rating.max)
        return movie
    })
    this.setState({ movies: results })
  }

  sortByYear = () => {
    const results = this.state.allMovies.filter(movie => {
      if (parseInt(movie.release_date) >= this.state.year.min && parseInt(movie.release_date) <= this.state.year.max + 1)
        return movie;
    })
    this.setState({ movies: results })
  }

  modifyImgUrl(path) {
    if (path === null) return "https://files.slack.com/files-pri/TG5NN1V8U-FK42LPB5E/noposter.jpg";
    return `https://image.tmdb.org/t/p/w500/${path}`;
  }

  renderMovies() {
    return (
      this.state.movies.map(({ title, overview, vote_average, backdrop_path, release_date, vote_count, id }) => {
        return (
          <div className="col-12 col-md-6 col-lg-4" key={id}>
            <Card style={{ marginBottom: 10 }}>
              <Card.Img variant="top" src={this.modifyImgUrl(backdrop_path)} />
              <Card.Body>
                <Card.Title className="over-flow" style={{ textAlign: "center", fontSize: 24, height: '3.5rem' }}>{title}</Card.Title>
                <Card.Text style={{ textAlign: "center" }}>
                  <ListGroup variant="flush" style={{ color: "#040F16" }}>
                    <ListGroup.Item className="over-flow" style={{ height: '15rem' }}>{overview}</ListGroup.Item>
                    <ListGroup.Item><b>Release Date:</b> {moment(release_date).format("MMM Do YY")}</ListGroup.Item>
                    <ListGroup.Item><b>Vote Count:</b> {vote_count}</ListGroup.Item>
                    <ListGroup.Item><b>Rating:</b> <label className="btn-sm btn-warning py-0 px-2">{vote_average}</label></ListGroup.Item>
                    <ListGroup.Item onClick={() => this.getTrailer(id)}><Button className="btn btn-trailer text-white">Watch Trailer</Button>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
        )
      })
    )
  }

  getTrailer = async (movieId) => {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=58049738a0f581e94fda3c41ab528a79`

    try {
      let data = await fetch(url);
      let response = await data.json();

      this.setState({
        isOpen: true,
        selectedMovieId: response.results[0].key,
      })

    } catch (error) {
      alert(error);
    }
  }

  renderNavFilterYear() {
    const { filterYearShown } = this.state
    return (
      <>
        <Nav.Link className="text-white"
          onClick={() => this.setState({ filterYearShown: !filterYearShown })}
          aria-controls="year-fade"
          aria-expanded={filterYearShown}
        >
          Filter By Years
        </Nav.Link>
      </>
    )
  }

  renderFilterYearFade() {
    return (
      <Fade in={this.state.filterYearShown}>
        <div id="year-fade">
          <InputRange
            maxValue={2019}
            minValue={1990}
            value={this.state.year}
            onChange={year => this.setState({ year }, this.sortByYear)} />
        </div>
      </Fade>
    )
  }

  renderNavFilterRating() {
    const { filterRatingShown } = this.state
    return (
      <>
        <Nav.Link className="text-white"
          onClick={() => this.setState({ filterRatingShown: !filterRatingShown })}
          aria-controls="rating-fade"
          aria-expanded={filterRatingShown}
        >
          Filter By Rating
        </Nav.Link>
      </>
    )
  }

  renderFilterRatingFade() {
    return (
      <Fade in={this.state.filterRatingShown}>
        <div id="rating-fade">
          <InputRange
            maxValue={10}
            minValue={0}
            value={this.state.rating}
            onChange={rating => this.setState({ rating }, this.sortByRating)} />
        </div>
      </Fade>
    )
  }


  renderNavBar() {
    return (
      <Navbar collapseOnSelect expand="xl" fixed="top" style={{ backgroundColor: "#000022" }} >
        <Navbar.Brand href="#">
          <img
            alt="logo"
            src="http://www.energycctv.com/uploads/4/7/0/1/47015565/1080p-fullhd-logo_3_orig.png"
            width="90"
            height="50"
            className="d-inline-block align-top"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" className="nav-toggle" />
        <Navbar.Collapse id="responsive-navbar-nav" style={{ textAlign: "center" }}>
          <Nav>
            <Nav.Link className="text-white" href="/">Home</Nav.Link>
            <Nav.Link className="text-white" onClick={this.sortByVotes}>Highest Votes</Nav.Link>
            <Nav.Link className="text-white" onClick={this.sortByAZ}>Movies A-Z</Nav.Link>
            {this.renderNavFilterYear()}
            {this.renderNavFilterRating()}
            <ul className="d-inline-flex list-unstyled mx-auto">
              <li style={{ width: "15rem", margin: "1.5rem auto 0", padding:"0 1.5rem" }}>{this.renderFilterYearFade()}</li>
              <li style={{ width: "15rem", margin: "1.5rem auto 0", padding:"0 1.5rem" }}>{this.renderFilterRatingFade()}</li>
            </ul>
          </Nav>

          <Form inline onSubmit={this.handleSearchClick} className="d-flex justify-content-center ml-auto mt-4 mt-xl-0 mb-4 mb-xl-0">
            <FormControl id="searchInput" type="text" placeholder="Your Movie" value={this.state.searchText} onChange={this.handleSearchChange} className="mr-sm-2" />
            <Button className="btn btn-custom mt-sm-0 mt-2" style={{ marginRight: "1rem" }} onClick={this.handleSearchClick}>Search</Button>
          </Form>
        </Navbar.Collapse>
      </Navbar>
    )
  }

  renderModal() {
    return (
      <Modal
        isOpen={this.state.isOpen}
        onRequestClose={() => this.setState({ isOpen: false })}
      >
        <YouTube
          video={this.state.selectedMovieId}
          autoplay
          height="100%"
          width="100%"
        />
      </Modal>
    )
  } s

  render() {

    if (this.state.isLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
          <RingLoader color={"#36D7B7"} />
        </div>)
    }

    return (
      <div>
        {this.renderModal()}
        {this.renderNavBar()}
        <Container style={{ marginTop: 90 }}>
          <Row>
            <Col xs={12} className="mt-4 mb-2">
              <h1 className="text-center">Now Featuring</h1>
            </Col>
          </Row>
          <ControlledCarousel movies={this.state.movies} />
          <Row>
            <Col xs={12} className="mt-4 mb-2">
              <h1 className="movie-selection"><span>Movie Selection</span></h1>
            </Col>
          </Row>
          <div className="d-flex justify-content-center movies-cards row">
            {this.renderMovies()}
          </div>
        </Container>
      </div>
    );
  }
}

class ControlledCarousel extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      index: 0,
      direction: null,
      selectedFeaturedMovieId1: "",
      selectedFeaturedMovieId2: "",
      selectedFeaturedMovieId3: ""
    };
  }

  handleSelect = (selectedIndex, e) => {
    this.setState({
      index: selectedIndex,
      direction: e.direction,
    });
  }

  componentDidMount() {
    this.getFeaturedTrailer1(this.props.movies[0].id)
    this.getFeaturedTrailer2(this.props.movies[1].id)
    this.getFeaturedTrailer3(this.props.movies[2].id)
  }

  getFeaturedTrailer1 = async (movieId) => {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=58049738a0f581e94fda3c41ab528a79`

    try {
      let data = await fetch(url);
      let response = await data.json();

      this.setState({
        selectedFeaturedMovieId1: response.results[0].key,
      })

    } catch (error) {
      alert(error);
    }
  }

  getFeaturedTrailer2 = async (movieId) => {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=58049738a0f581e94fda3c41ab528a79`

    try {
      let data = await fetch(url);
      let response = await data.json();

      this.setState({
        selectedFeaturedMovieId2: response.results[0].key,
      })

    } catch (error) {
      alert(error);
    }
  }

  getFeaturedTrailer3 = async (movieId) => {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=58049738a0f581e94fda3c41ab528a79`

    try {
      let data = await fetch(url);
      let response = await data.json();

      this.setState({
        selectedFeaturedMovieId3: response.results[0].key,
      })

    } catch (error) {
      alert(error);
    }
  }

  render() {
    const { index, direction } = this.state;

    return (
      <Row>
        <Col xs={12}>
          <Carousel
            activeIndex={index}
            direction={direction}
            onSelect={this.handleSelect}
          >
            <Carousel.Item>
              <YouTube
                video={this.state.selectedFeaturedMovieId1}
                height="550"
                width="100%"
              />
            </Carousel.Item>
            <Carousel.Item>
              <YouTube
                video={this.state.selectedFeaturedMovieId2}
                height="550"
                width="100%"
              />
            </Carousel.Item>
            <Carousel.Item>
              <YouTube
                video={this.state.selectedFeaturedMovieId3}
                height="550"
                width="100%"
              />
            </Carousel.Item>
          </Carousel>
        </Col>
      </Row>
    );
  }
}

export default App