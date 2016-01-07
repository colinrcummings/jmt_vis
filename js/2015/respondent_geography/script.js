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
          className={this.props.currentView == 'california' ?
          'btn btn-default btn-selected' : 'btn btn-default'}
        >California</button>
        <button
          key='usa'
          type='button'
          className={this.props.currentView === 'usa' ?
          'btn btn-default btn-selected' : 'btn btn-default'}
        >USA</button>
        <button
          key='world'
          type='button'
          className={this.props.currentView === 'world' ?
          'btn btn-default btn-selected' : 'btn btn-default'}
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
  componentWillUnmount: function() {
    // clean up map
    console.log('called');
    $('#js-cali-map-container').empty();
  },
  render: function() {
    // determine summary text
    var caliData = this.props.countyData.filter(function(d){
      return +d.california === 1;
    });
    var caliResp = d3.sum(caliData, function(d){ return +d.count; });
    var percCaliResp = oneDecimalPct(caliResp/this.props.totalResp);
    return (
      <div>
        <p>{noDecimalNum(caliResp)} of {noDecimalNum(this.props.totalResp)} total
        respondents were from California ({percCaliResp})</p>
        <div id='js-cali-map-container' className='map-container'></div>
      </div>
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
  componentWillUnmount: function() {
    // clean up map
    $('#js-us-map-container').empty();
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
      this.state.countyMap.style(this.props.countyData, this.props.incitsRef);
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
    // determine summary text (assumes a None, does not assume DC respondents)
    var usaResp = d3.sum(this.props.stateData, function(d){ return +d.count; });
    var percUSAResp = oneDecimalPct(usaResp/this.props.totalResp);
    var dcDataElement = this.props.stateData.filter(function(d){
      return d.state_code == 'US-DC';
    });
    var stateString;
    var dcString;
    if(dcDataElement.length === 1) {
      stateString = this.props.stateData.length - 2 + ' states';
      dcString = ' and the capital ';
    } else {
      stateString = this.props.stateData.length - 1 + ' states';
      dcString = '';
    }
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
          <li><a href='javascript:void(0)' className='us-map-select current-selection' id='state'>
            by state
          </a></li>
          <li><a href='javascript:void(0)' className='us-map-select' id='county'>
            by county
          </a></li>
        </ul>
      </div>
      <p>{noDecimalNum(usaResp)} of {noDecimalNum(this.props.totalResp)} total respondents
      came from {stateString}{dcString}({percUSAResp})</p>
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
  componentWillUnmount: function() {
    // clean up map
    $('#js-world-map-container').empty();
  },
  render: function() {
    // determine summary text (does not assumes a None, assumes USA respondents)
    var usaResp = +this.props.countryData.filter(function(d){
      return d.country_code == 'US';
    })[0].count;
    var nonUSAResp = this.props.totalResp - usaResp;
    var percNonUSAResp = oneDecimalPct(nonUSAResp/this.props.totalResp);
    var nonUSACountries = this.props.countryData.length - 1;
    return (
      <div>
        <p>{nonUSAResp} of {noDecimalNum(this.props.totalResp)} total respondents came
        from {nonUSACountries} countries outside of the USA ({percNonUSAResp})</p>
        <div id='js-world-map-container' className='map-container'></div>
      </div>
    );
  }
});

var AboutModal = React.createClass({
  render: function () {
    return (
      <div id='js-about-modal' className='modal fade zoom' role='dialog'>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <button type='button' className='close' data-dismiss='modal'>
                &times;
              </button>
              <h3 className='modal-title'>About</h3>
            </div>
            <div className='modal-body text-left'>
              { $(window).width() < 750 ?
                <div id='small-device-warning' className='alert-warning text-center'>
                  <i className='fa fa-mobile'></i>
                  <p>We noticed that you're visiting on a device with a small screen.
                  We recommend coming back on a tablet, laptop or desktop.</p>
                </div>
              : null}
              <p>This visualization represents the geographical distribution of
              2015 John Muir Trail Survey respondents in <a href='https://en.wikipedia.org/wiki/Choropleth_map' target='_blank'>
              choropleth</a> mappings by county, state and country. 1,377 of 1,403
              total respondents provided their country of origin (98.2%), and 1,271
              of 1,291 respondents in the USA provided their zip code (98.5%).
              To interact with the data:</p>
              <ul>
                <li>Toggle choropleth views using the buttons above the map</li>
                <li>View participant details by hovering over the map (tap on
                touchscreen devices)</li>
                <li>Zoom and pan the map with a trackpad or mousewheel (finger
                  pinch on medium and large touchscreen devices)</li>
              </ul>
              <p>Note that the distribution of survey respondents
              may not reflect the distribution of all JMT hikers for several
              reasons:</p>
               <ul>
                <li>Hikers living closer to the trail may be more likely to
                plan a repeat hike, and therefore may have participated
                disproportionately</li>
                <li>International hikers may have been less likely to visit the
                USA websites where most respondents were recruited</li>
                <li>Hikers with limited English-language skills may have avoided
                the survey</li>
              </ul>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-default' data-dismiss='modal'>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var App = React.createClass({
  getInitialState: function() {
    return {
      dataStatus: 'loading', // loading or complete
      view: 'usa' // california, usa or world
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
      // load incits reference data
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
          totalResp: d3.sum(data[6],function(d){ return +d.count; }),
          incitsRefData: data[7],
          dataStatus: 'complete'
        });
        // show footer
        $('footer').css('display','block');
        // show about modal
        $('#js-about-modal').modal('show');
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
              totalResp={this.state.totalResp}
            /> : null}
            {this.state.view == 'usa' ? <UnitedStatesMap
              countiesShape={this.state.usCountiesShape}
              statesShape={this.state.usStatesShape}
              countyData={this.state.respondentUSCountyData}
              stateData={this.state.respondentUSStateData}
              incitsRef={this.state.incitsRefData}
              totalResp={this.state.totalResp}
            /> : null}
            {this.state.view == 'world' ? <WorldMap
              countriesShape={this.state.worldCountriesShape}
              countryData={this.state.respondentWorldCountryData}
              totalResp={this.state.totalResp}
            /> : null}
          </div>
        }
        <AboutModal />
      </div>
    );
  }
});

ReactDOM.render(
  <App />,
  document.getElementById('react-hook')
);
