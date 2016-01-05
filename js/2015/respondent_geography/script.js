// react components
var DataStatus = React.createClass({
  render: function() {
    return (
      <div className='col-md-12'>
        <div id='data-status'>
          <i id='data-loading' className='fa fa-circle-o-notch fa-spin'></i>
          <p className='text-muted'>Initializing visualization...</p>
        </div>
      </div>
    );
  }
});

var ViewButtons = React.createClass({
  render: function() {
    return (
      <div id='view-btns' className='btn-group' onClick={this.props.viewChange}>
        <button
          key='california'
          type='button'
          className={this.props.currentView == 'california' ?'btn btn-default btn-selected' : 'btn btn-default'}
        >California</button>
        <button
          key='usa'
          type='button'
          className={this.props.currentView === 'usa' ? 'btn btn-default btn-selected' : 'btn btn-default'}
        >USA</button>
        <button
          key='world'
          type='button'
          className={this.props.currentView === 'world' ? 'btn btn-default btn-selected' : 'btn btn-default'}
        >World</button>
      </div>
    );
  }
});

var CaliforniaMap = React.createClass({
  getInitialState: function() {
    return {
      californiaMap: new CaliforniaCountyMap(this.props.countiesShape)
    };
  },
  componentDidMount: function() {
    // draw, style and handle resize of map
    this.state.californiaMap.draw('#js-cali-map-container');
    this.state.californiaMap.style(this.props.countyData);
    $(window).on('resize', function(){
      this.state.californiaMap.resize('#js-cali-map-container');
    }.bind(this));
  },
  render: function() {
    return (
      <div id='js-cali-map-container' className='map-container'></div>
    );
  }
});

var UnitedStatesMap = React.createClass({
  getInitialState: function() {
    return {
      currentMap: 'state',
      countyMap: new USCountyMap(this.props.countiesShape),
      stateMap: new USStateMap(this.props.statesShape)
    };
  },
  componentDidMount: function() {
    this.drawMap(this.state.currentMap);
  },
  drawMap: function(map) {
    // remove existing map
    $('#js-us-map-container').empty();
    // draw, style and handle resize of new map
    if(map == 'state') {
      this.state.stateMap.draw('#js-us-map-container');
      this.state.stateMap.style(this.props.stateData);
      $(window).on('resize', function(){
        this.state.stateMap.resize('#js-us-map-container');
      }.bind(this));
    } else if (map == 'county') {
      this.state.countyMap.draw('#js-us-map-container');
      this.state.countyMap.style(this.props.countyData);
      $(window).on('resize', function(){
        this.state.countyMap.resize('#js-us-map-container');
      }.bind(this));
    }
  },
  handleMapChange: function(e) {
    var selection = e.target.id;
    if(selection == 'state' || selection == 'county') {
      $('#us-map-select-text').text(e.target.innerHTML);
      $('.us-map-select').removeClass('current-selection');
      $('#' + selection).addClass('current-selection');
      this.drawMap(selection);
      this.setState({
        currentMap: selection
      });
    }
  },
  render: function() {
    return (
      <div>
      <div id='us-map-select-dropdown' className='dropdown'>
        <button
          className='btn btn-default dropdown-toggle'
          type='button'
          id='us-map-select'
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='true'
        >
          <span id='us-map-select-text'>by state</span> <span className='caret'></span>
        </button>
        <ul onClick={this.handleMapChange}
          className='dropdown-menu'
          aria-labelledby='us-map-select'
        >
          <li><a href='javascript:void(0)' className='us-map-select current-selection' id='state'>by state</a></li>
          <li><a href='javascript:void(0)' className='us-map-select' id='county'>by county</a></li>
        </ul>
      </div>
      <div id='js-us-map-container' className='map-container'></div>
      </div>
    );
  }
});

var WorldMap = React.createClass({
  getInitialState: function() {
    return {
      countryMap: new WorldCountryMap(this.props.countriesShape)
    };
  },
  componentDidMount: function() {
    // draw, style and handle resize of map
    this.state.countryMap.draw('#js-world-map-container');
    this.state.countryMap.style(this.props.countryData);
    $(window).on('resize', function(){
        this.state.countryMap.resize('#js-world-map-container');
    }.bind(this));
  },
  render: function() {
    return (
      <div id='js-world-map-container' className='map-container'></div>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {
      dataStatus: 'loading',
      view: 'usa' // california, usa, world
    };
  },
  componentDidMount: function () {
    this.loadData();
  },
  loadData: function () {
    queue()
      // load map shape files
      .defer(d3.json, 'data/maps/cali_counties.json')
      .defer(d3.json, 'data/maps/us_counties.json')
      .defer(d3.json, 'data/maps/us_states.json')
      .defer(d3.json, 'data/maps/countries.json')
      // load respondent geographical data
      .defer(d3.csv, 'data/jmt_2015_us_by_county.csv')
      .defer(d3.csv, 'data/jmt_2015_us_by_state.csv')
      .defer(d3.csv, 'data/jmt_2015_world_by_country.csv')
      // load us county reference data
      .defer(d3.csv, 'data/incits_code_ref.csv')
      .awaitAll(function(error, data) {
        if (error) throw error;
        // update state with data
        this.setState({
          caliCountiesShape: data[0],
          usCountiesShape: data[1],
          usStatesShape: data[2],
          worldCountriesShape: data[3],
          respondentUSCountyData: data[4],
          respondentUSStateData: data[5],
          respondentWorldCountryData: data[6],
          incitsRefData: data[7],
          dataStatus: 'complete'
        });
        // show footer
        $('footer').css('display','block');
      }.bind(this));
  },
  handleViewChange: function(e) {
    var viewClicked = e.target.getAttribute('data-reactid').split('$')[1].split('.')[0];
    this.setState({
      view: viewClicked
    });
  },
  render: function() {
    return (
      <div id='app' className='row text-center'>
        {this.state.dataStatus == 'loading' ? <DataStatus /> :
          <div className='col-md-10 col-md-offset-1'>
            <ViewButtons
              currentView={this.state.view}
              viewChange={this.handleViewChange}
            />
            {this.state.view == 'california' ? <CaliforniaMap
              countiesShape={this.state.caliCountiesShape}
              countyData={this.state.respondentUSCountyData}
            /> : null}
            {this.state.view == 'usa' ? <UnitedStatesMap
              countiesShape={this.state.usCountiesShape}
              statesShape={this.state.usStatesShape}
              countyData={this.state.respondentUSCountyData}
              stateData={this.state.respondentUSStateData}
            /> : null}
            {this.state.view == 'world' ? <WorldMap
              countriesShape={this.state.worldCountriesShape}
              countryData={this.state.respondentWorldCountryData}
            /> : null}
          </div>
        }
      </div>
    );
  }
});

ReactDOM.render(
  <App />,
  document.getElementById('react-hook')
);
