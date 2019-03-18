    /*
    USEFUL URLs

    Build a vertical scorller - https://vallandingham.me/scroller.html
    Build a histogram - https://www.d3-graph-gallery.com/graph/histogram_binSize.html
    earthquake data - https://earthquake.usgs.gov/earthquakes/search/
    colors - http://colorbrewer2.org/
    color ramps - http://bl.ocks.org/LuisSevillano/raw/e95704a8966ee81a0a88575fbf978cac/
    */

    var histo_xAxis;
    tjb.changedView = false;

    tjb.resize = false;

    $( window ).resize(function() {
      tjb.resize = true;
      throttle();
    });




    var throttleTimer;
    function throttle() {
      window.clearTimeout(throttleTimer);
        throttleTimer = window.setTimeout(function() {
          resizeAll();
        }, 50);
    }





    function redraw() {
      setup(width,height);
    }


    function setup(width,height){

      width = d3.select("#vis").style("width").replace("px",'');
      height = d3.select("#vis").style("height").replace("px",'');

      projection = d3.geoNaturalEarth()
                  .precision(.1)
                  .scale((width) / (2*Math.PI))
                  .translate([(width/2), (height*0.5)]);

      path = d3.geoPath().projection(projection);

      draw(topo);
    }



    tjb.falseCentroids = [];
    
    function draw(topo) {

      var country = parentG.selectAll(".country").data(countries);
      var boundary = boundariesG.selectAll(".boundaries").data(bounds);
      var plate = platesG.selectAll(".boundaries").data(plts);

      parentG.attr( "transform" , function(){ return "translate(" + (0) + "," + (0) + ")"; } );
      boundariesG.attr( "transform" , function(){ return "translate(" + (0) + "," + (0) + ")"; } );
      platesG.attr( "transform" , function(){ return "translate(" + (0) + "," + (0) + ")"; } );

      country
        .enter()
        .insert("path")
        .attr("d", path)
        .attr("class", function(d,i){ return "world country" + " " + d.properties.name; })
        .attr("id", function(d,i) { return d.properties.name; })
        .attr("title", function(d,i) { return d.properties.name; })
        .attr('data-c0', function(d) { return path.centroid(d)[0]; })
        .attr('data-c1', function(d) { return path.centroid(d)[1]; })
        .style("display", function(d,i){
          
          // enter switch statement to determine if country should be displayed or not
          switch( countriesToRemove.indexOf(d.properties.name) ) {
            case -1:
              return "inline";
              break;
            default:
              return "none";
              
          }// end switch
        });

      boundary
        .enter()
        .insert("path")
        .attr("d", path)
        .attr("class", function(d,i){ return "boundaries" + " " + d.properties.Type; })

      plate
        .enter()
        .insert("path")
        .attr("d", path)
        .attr('data-c0', function(d) { return path.centroid(d)[0]; })
        .attr('data-c1', function(d) { return path.centroid(d)[1]; })
        .attr("class", function(d,i){

          if( plateNames.indexOf(d.properties.PlateName)!=-1 ) {

            if( d.properties.PlateName=="North America" ) { x = 400; y = 400; }            
            else if( d.properties.PlateName=="Pacific" ) {  x = 200; y = 650; }
            else {
              x = parseFloat(d3.select(this).attr('data-c0'));
              y = parseFloat(d3.select(this).attr('data-c1'));
            }

            g.append( "text" )
              .attr( "class" , "plateLabels" )
              .attr( "id" , "plateLabel-" + d.properties.PlateName )
              .attr( "x" , x )
              .attr( "y" , y )             
              .text(d.properties.PlateName);
          }

          return "plates" +  " " + d.properties.PlateName;
        });



      
      tjb.earthquakes.forEach(function(d,i){

        g.selectAll(".epicentres.events.b" + d.FID)
          .transition()
          .duration(function(){
            if( tjb.resize==true ){ return 0; }
            else{ return 5000; }
          })
          .attr("cx", projection([+d.longitude,+d.latitude])[0]-margin.left )
          .attr("cy", projection([+d.longitude,+d.latitude])[1] );

      })

      setTimeout(function(){
        tjb.resize = false; 
      }, 4050)   
      
      return;
    
    }// end function draw();





    function resizeAll(){

      BrowserDetection();
      alertSize();
      mediaType();

      originalChartHeight = tjb.height*0.333

      if( tjb.diagnostics ){
        console.log( BrowserDetection() );
      }


      g.selectAll( ".counter" )
        .attr( "x" , d3.select( "#mainSVG" ).attr( "width" ).replace( "px" , '' )-(margin.right/2) )
        .attr( "y" , margin.top );

      d3.select("#sections")
        .style( "width" , "25%" );
      
      d3.select("#vis")
        .style( "width" , "75%" )
        .style( "height" , "100%" );

      d3.select( "#mainSVG" )
        .attr( "width" , d3.select( "#vis" ).style( "width" ).replace( "px" , "" ) )
        .attr( "height" , d3.select( "#vis" ).style( "height" ).replace( "px" , "" )-margin.bottom-margin.top );

      d3.select( "#waveG" )
        .attr( "transform" , "translate(" + (d3.select( "#mainSVG" ).attr( "width" )*0.5) + "," + (d3.select( "#mainSVG" ).attr( "height" )*0.5) + ")" );


      // update position of footnote    
      g.selectAll( ".source.footnote" )
        .attr( "x" , d3.select( "#mainSVG" ).attr("width")-margin.right )
        .attr( "y" , d3.select( "#mainSVG" ).attr("height")-0 )


      chartWidth = d3.select("#mainSVG").attr("width").replace("px",'');
      xScale = d3.scaleTime().domain([ parseTime( "1900-01-01") , parseTime("2019-12-31")]).range([ 0 , chartWidth-margin.left-margin.right ]);
      g.selectAll( ".barcode.axis.major.x" ).attr("transform", "translate(" + margin.left + "," + ((tjb.height*0.1)+originalChartHeight) + ")").call(d3.axisBottom(xScale));

      yScale = d3.scaleLinear().domain([ 0, 700 ]).range([0, originalChartHeight]); 
      g.selectAll( ".barcode.axis.major.y" ).attr("transform", "translate(" + margin.left + "," + (tjb.height*0.1) + ")").call(d3.axisLeft(yScale));

      d3.selectAll(".mainGraphTop_yticks")
        .attr( 'y0' , 0 )
        .attr( 'y1' , 0 )
        .attr( 'x1' , chartWidth-margin.left-margin.right )
        .attr( 'x2' , 0 );

      svgHeight =  d3.select( "#mainSVG" ).attr( "height" );
      chartHeight = ( (d3.select( "#mainSVG" ).attr( "height" ) )-margin.bottom-margin.top)/parseInt(tjb.numberMinorAxis+2);

      faultLegend = g.selectAll( ".faultsLegend.visLegend" )
                      .attr( "x" , (d3.select("#mainSVG").attr("width").replace("px",'')-d3.select("#faultsLegend").attr("width"))*0.5  )
                      .attr( "y" , d3.select("#mainSVG").attr("height").replace("px",'')*0.1  );


      var startYear = 1900;

      yPlacements = []

      for(var i=0; i<tjb.numberMinorAxis; i++){
        var y = chartHeight+(i*((svgHeight)/tjb.numberMinorAxis));
        yPlacements.push(y);
      }

      for(var i=0; i<tjb.numberMinorAxis; i++){

        startYear = 1900+(i*10);
        var endYear = startYear+9;

        var xScaleMini = d3.scaleTime().range([0, chartWidth-margin.left-margin.right]).domain([ parseTime(startYear+"-01-01") , parseTime(endYear+"-12-31") ]);
     
        g.selectAll( ".barcode.x.axis.minor.minor-"+i)
          .attr("transform", "translate(" + margin.left + "," + (0) + ")")
          .call(d3.axisBottom(xScaleMini));

        var yScaleMini = d3.scaleLinear().range([chartHeight*0.25, chartHeight]).domain([ 0,700 ]);

        g.selectAll( ".barcode.y.axis.minor.minor-"+i)
          .attr("transform", "translate(" + margin.left + "," + (chartHeight) + ")")
          .call(d3.axisLeft(yScaleMini));

        g.selectAll(".barcode.x.axis.minor.minor-"+i).attr("transform", "translate(" + (margin.left) + "," + (yPlacements[i]) + ")" );
        g.selectAll(".barcode.y.axis.minor.minor-"+i).attr("transform", "translate(" + (margin.left) + "," + (yPlacements[i]-chartHeight) + ")" );
   
      }// end for loop ...

      if( ti==0 ){
        d3.selectAll(".histo").remove();
      }
      else if( ti==1 ){
      
        if( tjb.slideCounter==0 ){
          d3.selectAll( ".barcode.g" ).attr( "transform" , "translate(" + margin.left + ", " + (tjb.height*0.1) + ")" );
          d3.selectAll( ".epicentres.events" )
            .attr( "cx" , function (d, i) { return xScale( parseTime(+d.time.substring(0,4) + "-" + d.time.substring(5,7) + "-" + d.time.substring(8,10)) ); })
            .attr( "cy" , function (d, i) { return yScale(d.depth); });

          showHistogramChart();
        }
       else if( tjb.slideCounter==1 ){

          for(var i=0; i<tjb.numberMinorAxis; i++){

          var startYear = 1900+(i*10);
          var endYear = startYear+9;

          var xScaleMini = d3.scaleTime().range([0, chartWidth-margin.left-margin.right]).domain([ parseTime(startYear+"-01-01") , parseTime(endYear+"-12-31") ]);
          var yScaleMini = d3.scaleLinear().range([chartHeight*0.25, chartHeight]).domain([ 0,700 ]);

            g.selectAll(".epicentres.events.axis-"+i )
              .attr('cx', function(d){ return xScaleMini( parseTime(+d.time.substring(0,4) + "-" + d.time.substring(5,7) + "-" + d.time.substring(8,10)) ); })
              .attr('cy', function(d){ return yPlacements[i] - margin.top - chartHeight + yScaleMini(+d.depth); });

          }// end for loop ...
        }// end else if ... 
      }
      else if( ti==2 ){

        d3.selectAll(".histo").remove();
        d3.selectAll(".world.country").remove();
        d3.selectAll(".boundaries").remove();
        d3.selectAll(".plates").remove();
        d3.selectAll(".plateLabels").remove();
        redraw();
      }
      else if( ti==3 ){

        var depthScale = d3.scaleLinear().domain([700.0,0.0]).range([parseFloat(tjb.height*0.85),parseFloat(tjb.height*0.05)]);

        d3.selectAll( ".highlight.highlight-g" ).attr( "transform" , "translate(" + (-25) + "," + (depthScale(tjb.evtDepth)) + ")" );

        d3.selectAll( ".depth.axis" )
          .attr( "transform" , "translate(" + (d3.select("#mainSVG").attr("width").replace("px",'')*0.90) + ", " + (0) + ")" )
          .call(d3.axisLeft(depthScale));

        g.selectAll('.depth.axis').selectAll('.tick')
          .attr( 'y0' , 0 )
          .attr( 'y1' , 0 )
          .attr( 'x1' , 0 )
          .attr( 'x2', -50 );
         
        earthquakes.forEach(function(d,i){
       
          g.selectAll(".epicentres.b" + d.FID)
            .attr("cx", ((d3.select("#mainSVG").attr("width").replace("px",'')*0.90))-150 )
            .attr("cy", depthScale(+d.depth) );
        })

        g.selectAll( ".masks.horizontal" )
          .attr( "width" , d3.select( "#mainSVG" ).attr( "width" ) )
          .attr( "height" , d3.select( "#mainSVG" ).attr( "height" )*0.5);

        g.selectAll( ".masks.vertical" )
          .attr( "x", d3.select( "#mainSVG" ).attr( "width" )*0.75 )  
          .attr( "width" , d3.select( "#mainSVG" ).attr( "width" )*0.25 );

        updateEventInformation();
      }
      else{

      }

      drawDepthLegend();
      drawMagLegend();

      return;


    } // end function resizeAll()




    function updateEventInformation(){

      g.selectAll( ".eventInformation" ).remove();
      g.append( "text" )
                      .attr( "class" , "eventInformation" )
                      .attr( "x" , function(){ return getButtonDimensions()+10; })
                      .attr( "y" , function(){ return margin.top+(getButtonDimensions()*2); })
                      .attr( "dy" , "0.35em" )
                      .text(tjb.evtInfo)
                      .call(wrap, ((d3.select( "#mainSVG" ).attr( "width" )*0.75) - getButtonDimensions()+10 - margin.left), getButtonDimensions()+10 );
      return;

    }// end function updateEventInformation()




    BrowserDetection();
    alertSize();
    mediaType();
    checkOrientation();


    /*
     * scrollVis - encapsulates
     * all the code for the visualization
     * using reusable charts pattern:
     * http://bost.ocks.org/mike/chart/
     */

      d3.select("#vis")
        .style(".width" , "75%")
        .style(".height" , "100%" )

      d3.select("#mainSVG")
        .attr("width" , d3.select("#vis").style("width").replace("px","") );

      // Keep track of which visualization
      // we are on and which was the last
      // index activated. When user scrolls
      // quickly, we want to call all the
      // activate functions that they pass.


      var plateNames = [ "Cocos" , "Scotia" , "Philippine Sea" , "Juan de Fuca" , "Caribbean" , "Africa" , "Antarctica" , "Somalia" , "India" , "Australia" , "Eurasia" , "North America" , "South America" , "Nazca" , "Pacific",  "Arabia" ];


      var colours = [ "#1a9850",
                      "#22934e",
                      "#2a8f4c",
                      "#338a4b",
                      "#3b8649",
                      "#438147",
                      "#4b7d45",
                      "#547844",
                      "#5c7442",
                      "#646f40",
                      "#6c6b3e",
                      "#74663c",
                      "#7d623b",
                      "#855d39",
                      "#8d5937",
                      "#955435",
                      "#9d5033",
                      "#a64b32",
                      "#ae4730",
                      "#b6422e",
                      "#be3e2c",
                      "#c7392b",
                      "#cf3529",
                      "#d73027" ];


        var sectionPositions = [];
        var sectionPositionsTest = [];
        
      var buttons = [
                      [ "scroll button back disabled" , "back" , "images/back.svg" ],
                      [ "scroll button next disabled" , "next" , "images/next.svg" ]/*,
                      [ "scroll button up disabled" , "up" , "images/up.svg" ],
                      [ "scroll button down disabled" , "down" , "images/down.svg" ]*/
                    ];
      // main svg used for visualization
      var svg = null;
      var xTransition = 0;
      var topo, countries;
      var x;
      var path;
      tjb.drawHistogram = false;
      var histo_xAxis;
      var bins;
      var mainGraphTop_yticks;
      var mainGraphBottom_yticks;
      var yPlacements = [];
      var magnitudeLegend;
      var svgHeight;
      tjb.numberMinorAxis = 12;
      var lastIndex = -1;
      var activeIndex = 0;  
      var plot;
      var g = null;
      myNodes = {};
      tjb.slideCounter = 0;
      var suffixes = ["th", "st", "nd", "rd"];
      var bubbles = null;
      var depthLabels = ["Shallow" , "Intermediate" , "Deep"];
      var yearCenters = {};
      var yearsTitleX = {};
      var earthquakes = {};
      var yearsPerRow = 10;
      var histo;
      var startYear;
      var endYear;
      var arr = [], yearsarr = [];
      var xScale;
      var pos;
      var yScale;
      var projection;
      var ai = -1;
      var ti = -1;
      var li = -1;
      var parentG, parentTESTG;
      tjb.isReloaded = false;
      var xScaleMini, yScaleMini;
      var transitionEventscounter = 0;
      var magnitudes = [7.0, 8.0, 9.0];
      var magnitudeCounts = [ 0 , 0 , 0 ];       
      var countriesToRemove = [ "Antarctica" ];
      var eventIDs = [ 8225 , 7393 , 7725 , 1151 ];
      var faults = [ "subduction" , "strike-slip" , "convergent" ];

      // initiates parth definition based on user defined map projections   
      var worldObject = {};
      var worldBoundaries = {};

      // constants to define the size
      // and margins of the vis area.
      var width = d3.select("#vis").style("width").replace("px",'');
      var height;
      var margin = { top: 0, left: 0, bottom: 0, right: 0 };
      var chartWidth = width;
      var originalChartHeight = tjb.height*0.333;
      tjb.highlight=false;
      var depthScale = d3.scaleLinear().domain([700.0,0.0]).range([tjb.height*0.8,tjb.height*0.1]);
      var magScale;



      if( tjb.mediaType=="mobile" ){
        magScale = d3.scalePow().exponent(0.5).domain([7, 10]).range([1, 10]);
        margin = { top: 5, left: 5, bottom: 5, right: 5 };
      }
      else if( tjb.mediaType=="tablet" ){
        magScale = d3.scalePow().exponent(0.5).domain([7, 10]).range([2.5, 15]);
        margin = { top: 25, left: 125, bottom: 85, right: 50 };
      }
      else if( tjb.mediaType=="desktop" ){
        magScale = d3.scalePow().exponent(0.5).domain([7, 10]).range([5, 30]);
        margin = { top: 25, left: 125, bottom: 100, right: 50 };
      }


      function suffix(number) {
        var tail = number % 100;
        return suffixes[(tail < 11 || tail > 13) && (tail % 10)] || suffixes[0];
      }

      var colorRange1 = ['#1a9850', '#fee08b', '#d73027'];
      var colorRange2 = ['#2c7bb6', '#ffffbf', '#d7191c'];
      var colorRange = colorRange1;

      var color = d3.scaleLinear().domain([100, 300, 700]).range(colorRange);


var timeFormat = d3.timeFormat("%Y/%m/%d");
var parseTime = d3.timeParse("%Y-%m-%d");
var months = ["January","February","March","April","May","June","July", "August","September","October","November","December"];


var scrollVis = function () {

  var steps = [];
  steps = d3.selectAll(".step");
  steps._groups[0].forEach(function(d,i){
    if( d.innerText=="Filler" ){ $(this).addClass("hidden"); }
  })

  // Sizing for the grid visualization
  var squareSize = 6;
  var squarePad = 2;
  var numPerRow = width / (squareSize + squarePad);


  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  //var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function (selection) {

    d3.selectAll(".histo").remove();
    height = d3.select("#vis").style("height").replace("px",'');

    selection.each(function (rawData) {

      // create svg and give it a width and height
      svg = d3.select(this).selectAll('svg').data([wordData]);
      var svgE = svg.enter().append('svg').attr("class" , "mainSVG").attr("id" , "mainSVG");


      // @v4 use merge to combine enter and existing selection
      svg = svg
              .merge(svgE)
              .attr( "width" , d3.select( "#vis" ).style( "width" ).replace( "px" , "" ) )
              .attr( "height" , d3.select( "#vis" ).style( "height" ).replace( "px" , "" ) )
   
      svg.append('g');

      // this group element will be used to contain all
      // other elements.
      g = svg.select('g').attr('transform', 'translate(' + 0 + ',' + 0 + ')');
      g.append("g")
        .attr("class", "depth axis")
        .attr("transform", "translate(" + (width/2) + "," + (0) + ")")
        .call(d3.axisRight(depthScale).ticks(8))
        .style("opacity" , 0.0)
        .selectAll("text")  
          .attr("class", "depth text")
          .attr("dx", "1em")
          .attr("dy", "0.33em")
          .attr("transform", "rotate(-0)")
          .style("text-anchor", "end")
          .style("fill", "#FFFFFF")
          .style("font-size", "12px")
          .style("text-anchor" , "start");



      // draw tick grid lines extending from y-axis ticks on axis across scatter graph
      var yticks = g.selectAll('.depth.axis').selectAll('.tick');          
      yticks.append('svg:line')
        .attr( 'class' , "onTop" )
        .attr( 'id' , "yAxisTicks" )
        .attr( 'y0' , 0 )
        .attr( 'y1' , 0 )
        .attr( 'x1' , 0 )
        .attr( 'x2', -50 )
        .style("opacity" , 0.33);

      g.selectAll(".axis.depth")
        .append("text")
        .attr("class", "onTop xAxis axisTitle")
        .attr("transform", "translate(" + (0) + "," + (tjb.height*0.85) + ")")
        .style("font-size", "16px")
        .style("font-weight" , "bold")
        .style("text-anchor" , "middle")
        .text("Focal Depth (km)");

      depthLabels.forEach(function(d,i){

        g.selectAll(".axis.depth")
          .append("text")
          .attr("class", "onTop depthLabel " + d)
          .attr("x" , (-60) )
          .attr("y" , depthScale(color.domain()[i]) )
          .text(d);
      })

      buttons.forEach(function(d, i) {

          g.append( "svg:image" )
            .attr("class" , d[0] )
            .attr("id" , d[1] )
            .attr("xlink:href" , d[2] )
            .attr( "width" , getButtonDimensions )
            .attr( "height" , getButtonDimensions )
            .attr( "x" , 0 )
            .attr( "y" , margin.top+(i*(getButtonDimensions()+5)) ) 
            .on( "click" , function() {
              if( this.id=="back" ){
                if( ti==1 ) { 
                  tjb.slideCounter--;  
                  d3.selectAll( ".counter" ).text("1/2")               
                  showDepthByTimeChart();
                }
                else if( ti==3 ) {                
                  transitionEvents(this.id);
                }
              } 
              else if( this.id=="next" ){
                if( ti==1 ) {  
                  tjb.slideCounter++;                  
                  transitionBarcodes(this.id);
                }
                else if( ti==3 ) {                  
                  transitionEvents(this.id);
                }
              } 
              else if( this.id=="up" ){
                onScrolling(activeIndex-1);
                manualMoveStepSection(); 
              } 
              else if( this.id=="down" ){
                onScrolling(activeIndex+1);
                manualMoveStepSection(); 
              }              
              return;
            });

      })// end forEadch


      var sel = d3.selectAll(".onTop");
      sel.moveToFront();

      // perform some preprocessing on raw data
      var wordData = getWords(rawData);




      setupVis();
      setupSections();
    // drawFootnotes();
      resizeAll();
    });
  };



  function manualMoveStepSection(){

    console.log("manualMoveStepSection")

    console.log("manualMoveStepSection(): " + activeIndex + " : " + sectionPositionsTest[activeIndex])
    console.log(-( (activeIndex*228) + (60*(activeIndex-1)) )+"px" );
    d3.select( "#sections" ).style( "top" , -( ((activeIndex+1)*228) + (60*(activeIndex-1)) )+"px" )


    return;

  }// end function manualMoveStepSection()




  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param wordData - data object for each word.
   * @param fillerCounts - nested data that includes
   *  element for each filler word type.
   * @param histData - binned histogram data
   */
  var setupVis = function () {

    console.log("setupVis")
    
    d3.selectAll(".histo").remove();

    $( ".scroll" ).addClass( "disabled" ).removeClass( "enabled" );
    $( ".scroll.down" ).addClass( "enabled" ).removeClass( "disabled" );
    $( ".scroll.counter" ).css( "opacity" , 0.0 );

    width = d3.select("#vis").style("width").replace("px",'');
    height = d3.select("#vis").style("height").replace("px",'');

   // changeView();
    drawMagLegend();
    drawDepthLegend();
    drawFaultsLegend();

    projection = d3.geoNaturalEarth()
                .precision(.1)
                .scale((width) / (2*Math.PI))
                .translate([(width/2), (height*0.5)]);

    path = d3.geoPath().projection(projection);


    g.selectAll('.openvis-title').attr('opacity', 0);
    g.selectAll('.image.wave').style('opacity', 1.0);
    g.selectAll('.count-title').attr('opacity', 0);
    xScale = d3.scaleTime().range([0, chartWidth-margin.left-margin.right]); 
    yScale = d3.scaleLinear().range([0, originalChartHeight]); 


    d3.csv("data/earthquakes.csv", function(error, data) {
      if (error) throw error;
      earthquakes = data;


      tjb.earthquakes = earthquakes.sort(function(x, y){
        return d3.ascending(x.mag, y.mag);
      })
            
      xScale.domain([ parseTime( "1900-01-01") , parseTime("2019-12-31")])
      yScale.domain([0,700]);

      tjb.earthquakes.forEach(function(d,i){
       
        d.lon = +d.longitude;
        d.lat = +d.latitude;
        d.m = +d.mag;
        d.year = d.time.substring(0,4);
        d.month = +d.time.substring(5,7);
        d.date = d.time.substring(8,10);
      }) 

      svgHeight =  d3.select("#mainSVG").attr("height");
      chartHeight = (svgHeight-margin.bottom-margin.top)/parseInt(tjb.numberMinorAxis+2);
      
      g.append("g")
        .attr("class", "barcode axis major x")
        .attr("transform", "translate(" + margin.left + "," + ((tjb.height*0.1)+originalChartHeight) + ")")
        .call(d3.axisBottom(xScale));

      g.append("g")
        .attr("class", "barcode axis major y")
        .attr("transform", "translate(" + margin.left + "," + (tjb.height*0.1) + ")")
        .call(d3.axisLeft(yScale));

      mainGraphTop_yticks = g.selectAll('.barcode.axis.major.y').selectAll('.tick');          
      mainGraphTop_yticks.append('svg:line')
        .attr( 'class' , "mainGraphTop_yticks" )
       /* .attr( 'id' , "yAxisTicks" )*/
        .attr( 'y0' , 0 )
        .attr( 'y1' , 0 )
        .attr( 'x1' , chartWidth-margin.left-margin.right )
        .attr( 'x2' , 0 )
        .style("opacity" , 0.333)
        .style("stroke-width" , "1.0px")
        .style("fill" , "none")
        .style("stroke" , "#A0A0A0");

      mainGraphTop_yticks.selectAll("text").attr("x" , "-15").style("opacity" , 1.0).style("text-anchor" , "end");
      g.selectAll( ".barcode.axis.major.y" ).append( "text" ).attr( "class" , "yAxisTitle" ).attr( "id" , "yAxisTitle" ).attr( "x" , 0 ).attr( "y" , -25 ).text("Focal Depth (km)")

      var startYear = 1900;

      for(var i=0; i<tjb.numberMinorAxis; i++){

        xScaleMini = d3.scaleTime().range([0, chartWidth-margin.left-margin.right]);  // map these the the chart width = total width minus padding at both 
        yScaleMini = d3.scaleLinear().range([0, chartHeight]);  // map these the the chart width = total width minus padding at both sides

        startYear = 1900+(i*10)
        var endYear = startYear+9;

        xScaleMini.domain([ parseTime(startYear+"-01-01") , parseTime(endYear+"-12-31") ]); 
        yScaleMini.domain([ 0, 700 ]);
        
        g.append("g")
          .attr("class", "barcode x axis minor minor-"+i)
          .attr("transform", "translate(" + margin.left + "," + (0) + ")")
          .call(d3.axisBottom(xScaleMini));
        
        g.append("g")
          .attr("class", "barcode y axis minor minor-"+i)
          .attr("transform", "translate(" + margin.left + "," + (chartHeight) + ")")
          .call(d3.axisLeft(yScaleMini));
      }

      drawEarthquakeChart(tjb.earthquakes);

      startYear = parseInt(xScale.domain()[0].toString().substring(11,15))
      endYear = parseInt(xScale.domain()[1].toString().substring(11,15))+1;
      arr = d3.timeYear.range(new Date(startYear,0,1) , new Date(endYear,0,1));
      arr.forEach(function(d,i){ yearsarr.push(d.toString().substring(11,15)); })

      var rowNumber = 0;
      var colNumber = 0;
      var yearCenters2 = {};


      yearsarr.forEach(function(d,i){

        if( colNumber==10 ) { colNumber=0; rowNumber++; }

        yearCenters2[d] = { x: 125+(colNumber * (width/13)), y: 125+(rowNumber * (height/13)) };
        yearsTitleX[d] = {  x: 62.5+(colNumber * (width/11)), y: 50+(rowNumber * (height/10)) };
        colNumber++;
      })
      yearCenters = yearCenters2;

    })



    // construct topojson file path and load topojson boundary set
    d3.json("data/world-topo-min.json", function(error, world) {
      if (error) throw error;
      
      // store data as local variable. 
      worldObject = world;
      countries = topojson.feature(world, world.objects.countries).features;
    });


    d3.json("data/PB2002_boundaries.json", function(error, boundaries ){            
      if (error) throw error;

      // store data as local variable. 
      worldBoundaries = boundaries;
      bounds = topojson.feature(worldBoundaries, worldBoundaries.objects.PB2002_boundaries).features;
    })


    d3.json("data/PB2002_plates.json", function(error, plates ){            
      if (error) throw error;

      // store data as local variable. 
      worldPlates = plates;
      plts = topojson.feature(worldPlates, worldPlates.objects.PB2002_plates).features;
    })






    function drawEarthquakeChart(data){

    console.log("drawEarthquakeChart")

      tjb.largeCounter = 0;

      $( ".scroll" ).addClass( "disabled" ).removeClass( "enabled" );
      $( ".scroll.down" ).addClass( "enabled" ).removeClass( "disabled" );
      $( ".scroll.counter" ).css( "opacity" , 0.0 );

      d3.selectAll(".histo").remove();

      d3.select( "#mainSVG" )
        .attr( "width" , d3.select("#vis").style("width").replace("px","") )
        .attr( "height" , d3.select("#vis").style("height").replace("px","")-margin.top-margin.bottom );   

      d3.selectAll(".magnitudeLabelsG").style("opacity" , 0.0);

      earthquakeBarcodeGroup = g.append('g')
                                .attr("class" , "barcode g")
                                .attr('transform', function(){ return 'translate(' +(margin.left) + ', ' + (tjb.height*0.1) + ')'; });

      var dateSortedData = data.sort(function(x, y){ return d3.descending(+x.FID, +y.FID); })

      g.append( "text" )
        .attr( "class" , "eventInfo furtherDetails" )
        .attr( "x" , margin.left )
        .attr("y" , 500 )
        .style( "opacity" , 0.0 )
        .style( "fill" , "#FFFFFF" )
        .text( "text" );

      earthquakeBarcodeGroup.selectAll('circle')
        .data(data)
        .enter()
        .append( "circle" )
        .attr( "class" , function (d, i) {

          var roundedM = (Math.floor(+d.mag)/1)*1;
          var index = magnitudes.indexOf(roundedM);
          magnitudeCounts[index]++;
          d3.selectAll(".counters"+roundedM).text(numberWithCommas(magnitudeCounts[index])+" events");

          var axis = -1;
          var boundingEndYear = -1;
          boundingEndYear = Math.ceil( (+d.time.substring(0,4)+0.01) /10)*10;
          axis = ((boundingEndYear-1900)/10)-1;

          tjb.magFlag = "small";

          if( d.mag>=8.0 ){
            tjb.magFlag="large";
            tjb.largeCounter++;
          }
          else{ tjb.magFlag = "small"; }

          var m = Math.floor((+(d.mag)/1)*1);
          return "epicentres onTop events b" + d.FID + " d" + d.depth + " m" + (+m) + " axis-" + axis + " " + tjb.magFlag;
        })
        .attr( "id" , function (d, i) { return "e"+d.FID; })
        .attr( "cx" , function (d, i) { return xScale( parseTime(+d.time.substring(0,4) + "-" + d.time.substring(5,7) + "-" + d.time.substring(8,10)) ); })
        .attr( "cy" , function (d, i) { return yScale(d.depth); })
        .attr( "r" , function (d, i) { return magScale(+d.mag); })
        .style( "fill-opacity" , 0.5 )
        .style( "stroke-width" , 1 )
        .style( "stroke" , function (d, i) {
          if( tjb.highlight==false ){ return color(d.depth); }
          else{
            if( d.mag<8.0 ){ return "#D0D0D0"; }
            else{ return color(d.depth); }
          }
        })
        .style( "fill" , function (d, i) {
          if( tjb.highlight==false ){ return color(d.depth); }
          else{
            if( d.mag<8.0 ){ return "#D0D0D0"; }
            else{ return color(d.depth); }
          }
      })


      g.selectAll(".barcode").style("opacity" , 0.0);



      
      parentG = g.append("g").attr("id", "parent-G").attr("transform" , function(){
        if( tjb.mediaType=="tablet" ){ return "translate(" + (0) + "," + (d3.select("#vis").style("height").replace("px","")*0.33) + ")"; }
        if( tjb.mediaType=="tablet" ){ return "translate(" + (0) + "," + (d3.select("#vis").style("height").replace("px","")*0.33) + ")"; }
        if( tjb.mediaType=="desktop" ){ return "translate(" + (0) + "," + (d3.select("#vis").style("height").replace("px","")*0.33) + ")"; }
      });
      boundariesG = g.append("g").attr("id", "boundaries-G").attr("transform" , function(){
        if( tjb.mediaType=="tablet" ){ return "translate(" + (0) + "," + (d3.select("#vis").style("height").replace("px","")*0.33) + ")"; }
        if( tjb.mediaType=="tablet" ){ return "translate(" + (0) + "," + (d3.select("#vis").style("height").replace("px","")*0.33) + ")"; }
        if( tjb.mediaType=="desktop" ){ return "translate(" + (0) + "," + (d3.select("#vis").style("height").replace("px","")*0.33) + ")"; }
      });
      platesG = g.append("g").attr("id", "plates-G").attr("transform" , function(){
        if( tjb.mediaType=="tablet" ){ return "translate(" + (0) + "," + (d3.select("#vis").style("height").replace("px","")*0.33) + ")"; }
        if( tjb.mediaType=="tablet" ){ return "translate(" + (0) + "," + (d3.select("#vis").style("height").replace("px","")*0.33) + ")"; }
        if( tjb.mediaType=="desktop" ){ return "translate(" + (0) + "," + (d3.select("#vis").style("height").replace("px","")*0.33) + ")"; }
      });


      var waveG = g.append("g")
        .attr( "id" , "waveG" )
        .attr("transform" , "translate(" + (d3.select("#mainSVG" ).attr("width")*0.5) + "," + (d3.select("#mainSVG" ).attr("height")*0.5) + ")");


      g.append( "svg:a" )
        .attr( "xlink:href" , "https://earthquake.usgs.gov/earthquakes/search/" )
          .attr( "target" , "_blank" )
          .append( "svg:text" )
          .attr( "class" , "source footnote" )
          .attr( "x" , d3.select( "#mainSVG" ).attr("width")-margin.right )
          .attr( "y" , d3.select( "#mainSVG" ).attr("height")-0 )
          .text("Source: United States Geological Survey (USGS)");  

      waveG.append( "svg:image" )
        .attr( "class" , "image wave" )
        .attr( "id" , "wave" )
        .attr( "xlink:href" , "images/wave.svg" )
        .attr( "width" , d3.select( "#mainSVG" ).attr("width" )*0.5 )
        .attr( "height" , d3.select( "#mainSVG" ).attr("height" )*0.5 )
        .attr( "x" , -d3.select( "#wave" ).attr( "width" )*0.5 )
        .attr( "y" , -d3.select( "#wave" ).attr( "height" )*0.5 );

      // count openvis title
      waveG.append( "text" )
        .attr( "class" , "title openvis-title" )
        .attr( "x" , 0 )
        .attr( "y" , 0 )
        .style( "text-anchor" , "middle" )
        .text( "Large-magnitude earthquakes from the start of the 20th Century" );

      var sel = d3.selectAll(".earthquakeBars");
      sel.moveToFront();

      var sel = d3.selectAll(".epicentres");
      sel.moveToFront();

      var sel = d3.selectAll(".barcode.g");
      sel.moveToFront();

      var sel = d3.selectAll(".barcode.axis.major");
      sel.moveToFront();

      var sel = d3.selectAll(".barcode.axis.major.xAxisTicks");
      sel.moveToFront();

      var sel = d3.selectAll(".onTop");
      sel.moveToFront();

      d3.selectAll(".histo").remove();

      //resizeAll();

      return;

    }// end function drawEarthquakeChart
  };







  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  var setupSections = function () {

    console.log("setupSections")

    // activateFunctions are called each
    // time the active section changes

    if( tjb.changedView==false ){

      console.log("tjb.changedView==false")

      activateFunctions[0] = showTitle;
      activateFunctions[1] = showDepthByTimeChart;
      activateFunctions[2] = makeMap;
      activateFunctions[3] = showDepthDistribution;
    }

    return;

  }; // end function setupSections





  function drawDepthLegendV(){

    var depths = [ 0, 100 , 300, 700 ];

    depthLegendV = g.append("svg")
      .attr("class" , "depthLegend vertical")
      .attr("id" , "depthLegendV")
      .attr("x" , 0)
      .attr("y" , tjb.height*0.5)
      .attr("width" , 75)
      .attr("height" , 275)
      .attr("fill" , "#FFFFFF")
      .attr("fill-opacity" , 0.5)
      .style("opacity" , 0.0);

    var svgDefs = depthLegendV.append('defs');

    var mainGradientV = svgDefs.append('linearGradient')
        .attr('id', 'mainGradientV');

     mainGradientV.append('stop')
                .attr('class', 'stop-left')
                .attr('offset', '0');

    mainGradientV.append('stop')
            .attr('class', 'stop-step1')
            .attr('offset', '0.1');

    mainGradientV.append('stop')
            .attr('class', 'stop-step2')
            .attr('offset', '0.3');

    var w = d3.select("#depthLegendV").attr("width");
    var h = d3.select("#depthLegendV").attr("height");

    depthLegendV.append("text")
      .attr("x" , w*0.1 )
      .attr("y" , h*0.95 )
      .style("fill" , "#FFFFFF")
      .style("stroke" , "none")
      .style("stroke-width" , "0.5px")
      .style("font-size" , "12px")
      .style("text-anchor" , "start")
      .text("Depth (km)");

    depthLegendV.append("rect")
      .classed('filled', true)
      .attr("id" , "rectV")
      .attr("x" , w*0.35)
      .attr("y" , h*0.05)
      .attr("width" , w*0.25)
      .attr("height" , h*0.85)
      .style("fill-opacity" , 0.5)
      .style("opacity" , 1.0)
      .style("stroke" , "#FFFFFF")
      .style("stroke-width" , "0.5px")
      .style("fill", "url(#mainGradientV)"); 

    depthLegendV.select('#mainGradientV').attr("gradientTransform", "rotate(90)");

    var rectW = d3.select("#rectV").attr("width");
    var rectH = d3.select("#rectV").attr("height");

    d3.select("#depthLegendV").attr("y" , (tjb.height*0.5)-(rectH/2) )

    depths.forEach(function(d,i){

      depthLegendV.append("rect")
        .attr("x" , w*0.35 )
        .attr("y" , (h*0.05)+(rectH/700)*d )
        .attr("width" , +parseInt(rectW)+5 )
        .attr("height" , 1 )
        .style("fill-opacity" , 1.0)
        .style("fill" , "#FFFFFF")
        .style("stroke-width" , 0.5);

      depthLegendV.append("text")
        .attr("x" , w*0.35+parseInt(rectW)+5 )
        .attr("y" , (h*0.05)+(rectH/700)*d )
        .style("fill-opacity" , 1.0)
        .style("fill" , "#FFFFFF")
        .style("stroke" , "none")
        .style("stroke-width" , "0.5px")
        .style("font-size" , "8px")
        .style("text-anchor" , "start")
        .text(d);
    })

    return;

  }// end function drawDepthLegendV()


  


  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  /**
   * showTitle - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */
  function showTitle() {

    console.log("showTitle")

    d3.select("#toolbar").style("visibility" , "visible");

    magnitudeLegend.style("opacity", 0.0);
    depthLegend.style("opacity" , 0.0);
    faultLegend.style("opacity" , 0.0);
    d3.selectAll(".histoG").style("opacity" , 0.0);
    d3.selectAll(".highlight.highlight-g").style("opacity" , 0.0);

    $( ".scroll" ).addClass( "disabled" ).removeClass( "enabled" );
    $( ".scroll.down" ).addClass( "enabled" ).removeClass( "disabled" );
    $( ".scroll.counter" ).css( "opacity" , 0.0 );

   // hide depth axis and profile
   g.selectAll(".depth.axis").style("opacity" , 0.0);

    g.selectAll('.count-title')
      .transition()
      .duration(0)
      .style('opacity', 0);

    g.selectAll('.openvis-title')
      .transition()
      .duration(0)
      .style('opacity', 1.0);

    g.selectAll('.image.wave')
      .transition()
      .duration(0)
      .style('opacity', 1.0);

    g.selectAll(".barcode")
      .transition()
      .duration(0)
      .style('opacity', 0)
      .style('pointer-events', "none");

    g.selectAll(".eventInfo")
      .transition()
      .duration(0)
      .style("opacity" , 0.0)
      .style('pointer-events', "none");


      return;
      
  }// end function showTitle









  function showDepthByTimeChart(){

    console.log("showDepthByTimeChart")

    g.selectAll( ".barcode.x.axis.minor" )
      .attr( "transform", "translate(" + margin.left + "," + (0) + ")" )
      .style( "opacity" , 0.0 );

    g.selectAll( ".barcode.y.axis.minor" )
      .attr( "transform", "translate(" + margin.left + "," + (chartHeight) + ")")
      .style( "opacity" , 0.0 );

    tjb.slideCounter = 0;
    faultLegend.style("opacity" , 0.0);

    d3.selectAll( ".barcode.g" ).attr( "transform" , "translate(" + (margin.left) + "," + (tjb.height*0.1) + ")")

    d3.selectAll( ".epicentres.events" )
      .attr( "cx" , function (d, i) { return xScale( parseTime(+d.time.substring(0,4) + "-" + d.time.substring(5,7) + "-" + d.time.substring(8,10)) ); })
      .attr( "cy" , function (d, i) { return yScale(d.depth); })
      .style( "fill-opacity" , 0.5 )
      .style( "stroke-width" , 1 );

    g.selectAll( ".barcode.x.axis.major" ).attr( "transform" , "translate(" + margin.left + "," + ((tjb.height*0.1)+originalChartHeight) + ")" );
    g.selectAll( ".barcode.y.axis.major" ).attr( "transform" , "translate(" + margin.left + "," + (tjb.height*0.1) + ")" );


    $( ".scroll" ).addClass( "disabled" ).removeClass( "enabled" );


    d3.selectAll(".histo").remove();
    d3.select("#toolbar").style("display" , "inline-block");

    var para = d3.selectAll(".para"+ti);
    para._groups[0][0].innerText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec fermentum mauris. Vivamus et tristique mauris, id tristique nulla. Proin efficitur eu velit id lobortis. Maecenas eu libero id est consequat mollis. Aliquam urna tellus, vestibulum eu dapibus a, ullamcorper sed tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque dapibus lobortis ipsum sed tristique. Ut tincidunt eros metus, quis ullamcorper massa tincidunt vel. Sed est libero, lacinia ut placerat eu, placerat ut nulla. Duis vel congue dui, sed tempus lorem. Morbi eleifend nisl id leo molestie cursus at vitae risus. In convallis efficitur ultrices. Nam rhoncus faucibus nunc. ";

    d3.select("#highlight").style("visibility" , "hidden");
    magnitudeLegend.style("opacity", 0.0);
    depthLegend.style("opacity" , 0.0);

    magnitudeLegend
      .transition()
      .duration(2500)
      .style("opacity" , 1.0);

    depthLegend
      .transition()
      .duration(2500)
      .style("opacity" , 1.0);

    $(".scroll.up").addClass("disabled").removeClass("enabled");
    $(".scroll.down").addClass("disabled").removeClass("enabled");

    g.selectAll('.openvis-title')
      .transition()
      .duration(0)
      .style('opacity', 0);

    g.selectAll('.image.wave')
      .transition()
      .duration(0)
      .style('opacity', 0.0);

    g.selectAll(".eventInfo")
      .transition()
      .duration(2500)
      .style("opacity" , 0.0)
      .style('pointer-events', "auto");

    if( ti>li ){

      g.selectAll(".barcode.axis.major")
        .transition()
        .duration(3500)
        .style("opacity" , 1.0)
        .style('pointer-events', "auto");

      g.selectAll(".barcode.g")
        .transition()
        .duration(0)
        .transition()
        .duration(3500)
        .style("opacity" , 1.0)
        .style('pointer-events', "auto");

      setTimeout(function(){

        $( ".scroll" ).addClass( "enabled" ).removeClass( "disabled" );
        $( ".scroll.back" ).addClass( "disabled" ).removeClass( "enabled" );
        $( ".scroll.counter" ).css( "opacity" , 1.0 );

        tjb.highlight=false;
        d3.select("#highlight").style("visibility" , "visible");
        $("#highlight").addClass("false").removeClass("true")
        d3.select("#highlight").text("Show only large events");
        
        
        var para = d3.selectAll(".para"+ti);
        para._groups[0][0].innerHTML = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec fermentum mauris. Vivamus et tristique mauris, id tristique nulla. Proin efficitur eu velit id lobortis. Maecenas eu libero id est consequat mollis. Aliquam urna tellus, vestibulum eu dapibus a, ullamcorper sed tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque dapibus lobortis ipsum sed tristique. Ut tincidunt eros metus, quis ullamcorper massa tincidunt vel. Sed est libero, lacinia ut placerat eu, placerat ut nulla. Duis vel congue dui, sed tempus lorem. Morbi eleifend nisl id leo molestie cursus at vitae risus. In convallis efficitur ultrices. Nam rhoncus faucibus nunc. ";

        var sel = d3.selectAll(".scroll");
        sel.moveToFront();

      },3000);

    }//
    else if( ti<li ){

      depthLegend
        .transition()
        .duration(2500)
        .style("opacity" , 1.0);

      g.selectAll(".country")
        .transition()
        .duration(2500)
        .style("opacity" , 0.0);

      g.selectAll(".boundaries")
        .transition()
        .duration(2500)
        .style("opacity" , 0.0);

      g.selectAll(".plates")
        .transition()
        .duration(2500)
        .style("opacity" , 0.0);

      g.selectAll(".plateLabels")
        .transition()
        .duration(2500)
        .style("opacity" , 0.0);

      tjb.slideCounter = 0;

      g.selectAll(".barcode.axis.major.x")
        .transition()
        .duration(0)
        .attr("transform", "translate(" + margin.left + "," + ((tjb.height*0.1)+originalChartHeight) + ")")
        .transition()
        .duration(2500)
        .style("opacity" , 1.0)
        .style('pointer-events', "auto");

      g.selectAll(".barcode.axis.major.y")
        .transition()
        .duration(0)
        .attr("transform", "translate(" + margin.left + "," + (tjb.height*0.1) + ")")
        .transition()
        .duration(2500)
        .style("opacity" , 1.0)
        .style('pointer-events', "auto");

      g.selectAll(".barcode.g")
        .transition()
        .duration(2500)
         .attr('transform', function(){ return 'translate(' + margin.left + ', ' + (tjb.height*0.1) + ')'; })
        .style("opacity" , 1.0)
        .style('pointer-events', "auto");

      setTimeout(function(){
     
        g.selectAll(".epicentres circle")
          .transition()
          .duration(4000)
          .style("stroke-opacity", function(d,i){
            if( tjb.highlight==false ){ return 1.00; }
            else{
              if( d.mag<8.0 ){ return 0.0; }
              else{ return 1.00; }
            }
          })
          .style("fill-opacity", function(d,i){
            if( tjb.highlight==false ){ return 0.66; }
              else{
                if( d.mag<8.0 ){ return 0.0; }
                else{ return 0.66; }
            }
          });

        g.selectAll(".epicentres.events")
          .transition()
          .duration(4000)
          .attr('cx', function (d, i) { return xScale( parseTime(+d.time.substring(0,4) + "-" + d.time.substring(5,7) + "-" + d.time.substring(8,10)) ); })
          .attr('cy', function (d, i) { return yScale(+d.depth); })
          .style('fill', function(d,i){ return color(d.depth); }) 
          .style("stroke-opacity", function(d,i){
            if( tjb.highlight==false ){ return 1.00; }
            else{
              if( d.mag<8.0 ){ return 0.0; }
              else{ return 1.00; }
            }
          })        
          .style("fill-opacity", function(d,i){
            if( tjb.highlight==false ){ return 0.66; }
            else{
              if( d.mag<8.0 ){ return 0.0; }
              else{ return 0.66; }
            }
          })
          .style('stroke', function(d,i){ return color(d.depth); })
      },1000);

      setTimeout(function(){

        $(".scroll.up").addClass("enabled").removeClass("disabled");
        $(".scroll.next").addClass("enabled").removeClass("disabled");
        d3.selectAll(".scroll.next.counter").style("opacity" , 1.0).style("display" , "inline").text("1/2");
        d3.select("#next").style("display" , "inline").style("cursor" , "pointer");

        if( $("#view").hasClass("nostory") ){
          $(".scroll.next").addClass("enabled").removeClass("disabled");
        }

        tjb.highlight=false;
        d3.select("#highlight").style("visibility" , "visible");
        $("#highlight").addClass("false").removeClass("true")
        d3.select("#highlight").text("Show only large events");
        
        
        var para = d3.selectAll(".para"+ti);
        para._groups[0][0].innerHTML = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec fermentum mauris. Vivamus et tristique mauris, id tristique nulla. Proin efficitur eu velit id lobortis. Maecenas eu libero id est consequat mollis. Aliquam urna tellus, vestibulum eu dapibus a, ullamcorper sed tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque dapibus lobortis ipsum sed tristique. Ut tincidunt eros metus, quis ullamcorper massa tincidunt vel. Sed est libero, lacinia ut placerat eu, placerat ut nulla. Duis vel congue dui, sed tempus lorem. Morbi eleifend nisl id leo molestie cursus at vitae risus. In convallis efficitur ultrices. Nam rhoncus faucibus nunc. ";
        //innerText("text");

        var sel = d3.selectAll(".scroll");
        sel.moveToFront();

      },500);
    } 
    else{

    }

    showHistogramChart();

    return;

  }// end function showDepthByTimeChart();







  function transitionBarcodes(){


    $( ".scroll" ).addClass( "disabled" ).removeClass( "enabled" );

    var para = d3.selectAll(".para"+ti);
    para._groups[0][0].innerText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec fermentum mauris. Vivamus et tristique mauris, id tristique nulla. Proin efficitur eu velit id lobortis. Maecenas eu libero id est consequat mollis. Aliquam urna tellus, vestibulum eu dapibus a, ullamcorper sed tellus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque dapibus lobortis ipsum sed tristique. Ut tincidunt eros metus, quis ullamcorper massa tincidunt vel. Sed est libero, lacinia ut placerat eu, placerat ut nulla. Duis vel congue dui, sed tempus lorem. Morbi eleifend nisl id leo molestie cursus at vitae risus. In convallis efficitur ultrices. Nam rhoncus faucibus nunc. ";

    d3.selectAll(".histo").remove();
    g.selectAll(".scroll.next.counter").text("2/2");

    $(".scroll.up").addClass("disabled").removeClass("enabled");
    $(".scroll.next").addClass("disabled").removeClass("enabled");


    for(var i=0; i<tjb.numberMinorAxis; i++){
      var y = chartHeight+(i*((svgHeight)/tjb.numberMinorAxis));
      yPlacements.push(y);
    }

    setTimeout(function(){
      g.selectAll(".barcode.axis.major")
        .transition()
        .duration(2000)
        .attr("transform" , "translate(" + (margin.left) + "," + (margin.top+chartHeight) + ")" )
        .style("opacity" , 0.);

      g.selectAll(".barcode.g" )
        .transition()
        .duration(2000)
        .attr("transform" , "translate(" + (margin.left) + "," + (margin.top) + ")" )
        .style("opacity" , 1.0)
        .style('pointer-events', "auto");

        g.selectAll(".epicentres.events" )
          .transition()
          .duration(2000)
          .attr('cy', function (d, i) { return yScaleMini(+d.depth); })        
          .style("opacity", function (d, i) {
            if( tjb.highlight==false ){ return 1.00; }
            else{
              if( d.mag<8.0 ){ return 0.0; }
              else{ return 1.00; }
            }
          })
          .style('pointer-events', "auto");

    }, 250);

    setTimeout(function(){

      var startYear = 1900;

      for(var i=0; i<tjb.numberMinorAxis; i++){

        startYear = 1900+(i*10);
        var endYear = startYear+9;

        var xScaleMini = d3.scaleTime().range([0, chartWidth-margin.left-margin.right]); 
        xScaleMini.domain([ parseTime(startYear+"-01-01") , parseTime(endYear+"-12-31") ]);

        yScaleMini = d3.scaleLinear().range([chartHeight*0.25, chartHeight]); 
        yScaleMini.domain([ 0,700 ]);

        g.selectAll(".barcode.x.axis.minor.minor-"+i)
            .transition()
            .duration(2500)
            .ease(d3.easeCubic)
            .attr("transform", "translate(" + (margin.left) + "," + (yPlacements[i]) + ")" )
            .style("opacity" , 1.0)
            .style('pointer-events', "none");

        g.selectAll(".barcode.y.axis.minor.minor-"+i)
            .transition()
            .duration(2500)
            .ease(d3.easeCubic)
            .attr("transform", "translate(" + (margin.left) + "," + (yPlacements[i]-chartHeight) + ")" )
            .style("opacity" , 0.0)
            .style('pointer-events', "none");
   
        g.selectAll(".epicentres.events.axis-"+i )
          .transition()
          .duration(2500)
          .attr('cx', function(d){ return xScaleMini( parseTime(+d.time.substring(0,4) + "-" + d.time.substring(5,7) + "-" + d.time.substring(8,10)) ); })
          .attr('cy', function(d){ return yPlacements[i] - margin.top - chartHeight + yScaleMini(+d.depth); }) 
          .style("opacity", function(d,i){
            if( tjb.highlight==false ){ return 1.00; }
            else{
              if( d.mag<8.0 ){ return 0.0; }
              else{ return 1.00; }
            }
          })
          .style('pointer-events', "auto");
      }

    }, 3000);


    setTimeout(function(){
        $( ".scroll" ).addClass( "enabled" ).removeClass( "disabled" );
        $( ".scroll.next" ).addClass( "disabled" ).removeClass( "enabled" );
        $( ".scroll.counter" ).css( "opacity" , 1.0 );
    },6000);


    return;

  }// end function transitionBarcodes();






  
  function show_hidetooltips(i,txt){
   
    d3.selectAll(".annotation").transition().duration(1250).style("opacity" , 0.0);
    d3.selectAll(".eventInfo.furtherDetails").transition().duration(1250).style("opacity" , 0.0);

    var text = labels[i].data.furtherDetails;

    d3.selectAll(".annotationNumber-"+i).transition().duration(1250).style("opacity" , 1.0);

    return;

  }// end function show_hidetooltips()



 function display(error, data) {
    if (error) { console.log(error); }
    return;  

  }// end function display
 



  /**
   * makeMap - show fillers in grid
   *
   * hides: barchart, text and axis
   * shows: square grid and highlighted
   *  filler words. also ensures squares
   *  are moved back to their place in the grid
   */
  function makeMap() {

    tjb.slideCounter=0;

    d3.selectAll( ".masks" ).remove();
    d3.selectAll( ".histo" ).remove();

    $( ".scroll" ).addClass( "disabled" ).removeClass( "enabled" );
    $( ".scroll.counter" ).css( "opacity" , 0.0 );

    d3.select("#highlight").style("visibility" , "visible");

    // hide depth axis and profile
    g.selectAll(".depth.axis").style("opacity" , 0.0);

    g.selectAll(".barcode.annotations")
      .transition()
      .duration(1000)
      .style("opacity" , 0.0)
      .style('pointer-events', "none");

    g.selectAll(".barcode.axis")
      .transition()
      .duration(1000)
      .style("opacity" , 0.0)
      .style('pointer-events', "none");

    g.selectAll(".eventInfo")
      .transition()
      .duration(1000)
      .style("opacity" , 0.0)
      .style('pointer-events', "none");

    if( ti>li ){

      tjb.resize = false;

      d3.selectAll( ".histo" ).remove();
      d3.selectAll( ".world.country" ).remove();
      d3.selectAll( ".boundaries" ).remove();
      redraw();

      setTimeout(function(){

        faultLegend
          .transition()
          .duration(2500)
          .style("opacity" , 1.0);

        g.selectAll( ".barcode.g" )
          .transition()
          .duration(2500)
          .attr("transform" , function(){
            if( tjb.mediaType=="mobile" ){ return "translate(" + (0) + "," + (((tjb.height*0.25))) + ")"; }
            if( tjb.mediaType=="tablet" ){ return "translate(" + (margin.left) + "," + (0) + ")"; }
            if( tjb.mediaType=="desktop" ){ return "translate(" + (margin.left) + "," + (0) + ")"; }
          })
          .style('pointer-events', "auto");

      }, 1000);

      setTimeout(function(){

        d3.selectAll(".country")
          .transition()
          .duration(2500)
          .style("opacity", 0.33);

        d3.selectAll(".boundaries")
          .transition()
          .duration(3000)
          .style("opacity",1.0);

        magnitudeLegend
          .transition()
          .duration(2500)
          .style("opacity" , 1.0);

      }, 4000);
    }
    if( ti<li ){

      g.selectAll(".eventInformation").style("opacity" , 0.0)

      setTimeout(function(){

        earthquakes.forEach(function(d,i){

          g.selectAll(".epicentres.b" + d.FID)
            .transition()
            .duration(2500)
            .attr("cx", function(d,i){ return projection([+d.longitude,+d.latitude])[0]-margin.left; })
            .attr("cy", function(d,i){ return projection([+d.longitude,+d.latitude])[1]; })
            .style("stroke-opacity", function(d,i){
              if( tjb.highlight==false ){ return 1.00; }
              else{
                if( d.mag<8.0 ){ return 0.0; }
                else{ return 1.00; }
              }
            })
            .style("fill-opacity", function(d,i){
              if( tjb.highlight==false ){ return 0.66; }
                else{
                  if( d.mag<8.0 ){ return 0.0; }
                  else{ return 0.66; }
              }
            })
            .style("opacity",  1.00 )
            .style("stroke-width" , "1.5px")
            .style('pointer-events', "auto");
        })
      }, 1500);

      setTimeout(function(){

        d3.selectAll(".country")
          .transition()
          .duration(2500)
          .attr( "transform" , "translate(0,0) scale(1)")
          .style("opacity", 0.33);

        d3.selectAll(".boundaries")
          .transition()
          .duration(3000)
          .attr( "transform" , "translate(0,0) scale(1)")
          .style("opacity",0.5);

        d3.selectAll(".plates")
          .transition()
          .duration(3000)
          .attr( "transform" , "translate(0,0) scale(1)")
          .style("opacity",0.5);

      }, 3500);

    }

    setTimeout(function(){
 
      $( ".scroll" ).addClass( "disabled" ).removeClass( "enabled" );
      $( ".scroll.up" ).addClass( "enabled" ).removeClass( "disabled" );
      $( ".scroll.down" ).addClass( "enabled" ).removeClass( "disabled" );
      $( ".scroll.counter" ).css( "opacity" , 0.0 );

    },6500);

    return;

  }// end function makeMap()








  /*
  showDepthDistribution
  */
  function showDepthDistribution() {

    tjb.slideCounter = 0;

    faultLegend.style("opacity" , 0.0);

    d3.select("#highlight").style("visibility" , "hidden"); 
    d3.selectAll(".masks").remove();
    $( ".scroll" ).addClass( "disabled" ).removeClass( "enabled" );

    setTimeout(function(){

      d3.selectAll( ".country" )
        .transition()
        .duration(750)
        .style( "opacity" , 0.0 );

      d3.selectAll( ".boundaries" )
        .transition()
        .duration(750)
        .style( "opacity" , 0.0 );

      g.selectAll( ".plates" )
        .transition()
        .duration(750)
        .style( "opacity" , 0.0 );

      g.selectAll( ".plateLabels" )
        .transition()
        .duration(2500)
        .style( "opacity" , 0.0 );

    }, 500);

    setTimeout(function(){

      g.selectAll(".xAxis.axisTitle").transition().duration(2500).style("opacity", 1.0);
      depthScale = d3.scaleLinear().domain([700.0,0.0]).range([ d3.select("#mainSVG").attr("height")*0.9 , d3.select("#mainSVG").attr("height")*0.1 ]);
      d3.selectAll(".axis.depth").transition().duration(0).attr("transform", "translate(" + (d3.select("#mainSVG").attr("width")/2) + "," + (0) + ")").call(d3.axisRight(depthScale).ticks(8)).style("opacity" , 1.0);
      d3.selectAll(".barcode.g").transition().duration(2500).attr("transform" , "translate(" + margin.left + "," + (0) + ")");

      depthLabels.forEach(function(d,i){
        g.selectAll(".depthLabel."+d)
          .attr("x" , (-60) )
          .attr("y" , depthScale(color.domain()[i]) ) 
          .style("font-size", "16px")
          .style("font-weight" , "bold")
          .style("text-anchor" , "end");
      })

    }, 500);

    setTimeout(function(){

      tjb.earthquakes.forEach(function(d,i){

        g.selectAll(".epicentres.events.b" + d.FID)
              .transition()
              .duration(4000)
              .attr("cx", (d3.select("#mainSVG").attr("width")/2)-150 )
              .attr("cy", depthScale(+d.depth) )
              .style('stroke', function(d,i){ return color(d.depth); })
              .style('fill', function(d,i){ return color(d.depth); })
              .style('fill-opacity', function(d,i){
                if( tjb.highlight==false ){ return 0.50; }
                else{
                  if( d.mag<8.0 ){ return 0.0; }
                  else{ return 0.50; }
                }
              }); 
        })

    }, 500);


    setTimeout(function(){

      d3.selectAll(".depth.axis.tick").remove();
      g.selectAll(".xAxis.axisTitle").transition().duration(2500).style("opacity", 0.0);

      depthScale = d3.scaleLinear().domain([700.0,0.0]).range([parseFloat(tjb.height*0.85),parseFloat(tjb.height*0.05)]);

      xTransition = d3.select("#mainSVG").attr("width").replace("px","")*0.90;

      g.selectAll(".depth.axis")
        .transition()
        .duration(2500)
        .ease(d3.easeCubic)
        .attr("transform", "translate(" + (xTransition) + "," + (0) + ")" )
       .call(d3.axisRight(depthScale).ticks(8));

      g.selectAll(".tick text") 
          .attr("class", "depth text")
          .style("text-anchor", "end")
          .attr("dx", "1em")
          .attr("dy", "0.33em")
          .attr("transform", "rotate(-0)")
          .style("fill", "#FFFFFF")
          .style("font-size", "12px")
          .style("text-anchor" , "start");

      var yticks = g.selectAll('.depth.axis').selectAll('.tick');          
      yticks.append('svg:line')
        .attr( 'id' , "yAxisTicks" )
        .attr( 'y0' , 0 )
        .attr( 'y1' , 0 )
        .attr( 'x1' , 0 )
        .attr( 'x2', -50 )
        .style("opacity" , 0.33);
        
      earthquakes.forEach(function(d,i){
     
        g.selectAll(".epicentres.b" + d.FID)
          .transition()
          .duration(2500)
          .ease(d3.easeCubic)
          .attr("cx", (xTransition)-150 )
          .attr("cy", depthScale(+d.depth) );
      })
  
      depthLabels.forEach(function(d,i){
        g.selectAll( ".depthLabel."+d )
          .attr( "x" , (-60) )
          .attr( "y" , depthScale(color.domain()[i]) ) 
          .style( "font-size", "16px" )
          .style( "font-weight" , "bold" )
          .style( "text-anchor" , "end" );
      })

      g.selectAll( ".eventInfo.furtherDetails" )
        .transition()
        .duration(2500)
        .ease(d3.easeCubic)
        .attr( "y" , function(){ return margin.top+getButtonDimensions(); })
        .attr( "x" , function(){ return getButtonDimensions()+10; })
        .style( "opacity" , 1.0 )
        .style( "font-size", "16px" )
        .style( "font-weight" , "bold" )
        .style( "text-anchor" , "start" )
        .text( "Detail" );

    }, 6500);

  
    setTimeout(function(){

        transitionEvents();
        tjb.slideCounter++;

    }, 9000)


    setTimeout(function(){
      $( ".scroll" ).addClass( "disabled" ).removeClass( "enabled" );
      $( ".scroll.up" ).addClass( "enabled" ).removeClass( "disabled" );
      $( ".scroll.next" ).addClass( "enabled" ).removeClass( "disabled" );
      $( ".scroll.counter" ).css( "opacity" , 1.0 );
    }, 10000);

    var sel = d3.selectAll( ".depth.axis" );
    sel.moveToFront();
    var sel = d3.selectAll( ".magnitudeLegend" );
    sel.moveToBack();
    var sel = d3.selectAll( ".depthLegend" );
    sel.moveToBack();



    return;

  }// end function() showDepthDistribution




  function transitionEvents(fid){

    if( fid=="back" ){ transitionEventscounter--; }
    else if( fid=="next" ){ transitionEventscounter++; }

    d3.selectAll(".highlightCircle").style("opacity" , 0.0);
    d3.selectAll(".epicentres").style("opacity" , 1.0);
    d3.selectAll(".highlight-g").remove();

    d3.select("#highlight").style("visibility" , "hidden");

    var info = getByKey(eventIDs[transitionEventscounter]);
    tjb.evtInfo = info.information;
    tjb.evtDepth = info.depth;
    
    d3.selectAll(".scroll").style("display" , "inline");

    if( tjb.slideCounter==0 ){
      $(".scroll.back").addClass("disabled").removeClass("enabled");
      $(".scroll.next").addClass("enabled").removeClass("disabled");
    }
    else if( tjb.slideCounter==eventIDs.length-1 ){
      $(".scroll.back").addClass("enabled").removeClass("disabled");
      $(".scroll.next").addClass("disabled").removeClass("enabled");
    }
    else{
      $(".scroll.back").addClass("enabled").removeClass("disabled");
      $(".scroll.next").addClass("enabled").removeClass("disabled");
    }

    $(".scroll.up").addClass("enabled").removeClass("disabled");
    $(".scroll.down").addClass("disabled").removeClass("enabled");

    if( transitionEventscounter<eventIDs.length ){

      d3.selectAll( ".highlightEpicentre" ).remove();
      g.selectAll( ".scroll.next.counter" ).style( "opacity" , 1.0 ).text( (parseInt(transitionEventscounter+1).toString())+"/"+eventIDs.length);
      d3.selectAll( ".epicentres.events" ).style( "opacity"  , 0.05 );

      d3.selectAll(".epicentres.events.b" + info.FID)
        .style("opacity" , 1.00 )
        .style("fill-opacity" , 1.00 )
        .style("stroke-opacity", 1.00 );

      var highlightG = d3.selectAll( ".depth.axis" )
        .append( "g" )
        .attr( "class" , "highlight highlight-g ")
        .attr( "transform" , "translate(" + (-25) + "," + (depthScale(+info.depth)) + ")" );

        highlightG.append("circle")
                    .attr("class" , "highlightCircle")
                    .attr("cx" , 0)
                    .attr("cy" , 0)
                    .attr("r" , magScale(+info.mag)+5 )
                    .style("stroke-width" , "2.5px")
                    .style("stroke" , "#FFFFFF")
                    .style("fill" , "none");

        /*boundariesG*/platesG.append("circle")
            .attr("class" , "highlightEpicentre")
            .attr("cx", projection([+info.longitude,+info.latitude])[0] )
            .attr("cy", projection([+info.longitude,+info.latitude])[1] )
            .attr("r" , magScale(+info.mag) )
            .style("fill" , color(info.depth))
            .style("stroke" , color(info.depth))
            .style("stroke-width" , "1.5px")
            .style("fill-opacity" , 0.66);

          d3.selectAll(".country")
                    .transition()
                    .duration(2500)
                    .style("opacity", 0.33);

          d3.selectAll(".boundaries")
                    .transition()
                    .duration(750)
                    .style("opacity",1.0);
    /*
      "bounds":[
                 
                  [ top left corner latlon ],
                  [ bottom right corner latlon ] 
                ],
    */

      var halfWidth = 15;
      var bounds =  [
                        [
                          d3.min([
                                projection([ Number(+info.longitude-halfWidth), Number(+info.latitude-halfWidth) ])[0],
                                projection([ Number(+info.longitude+halfWidth), Number(+info.latitude+halfWidth) ])[0]
                              ]),
                          d3.min([
                                projection([ Number(+info.longitude-halfWidth), Number(+info.latitude-halfWidth) ])[1],
                                projection([ Number(+info.longitude+halfWidth), Number(+info.latitude+halfWidth) ])[1]
                              ]),
                        ],
                        [
                          d3.max([
                                projection([ Number(+info.longitude-halfWidth), Number(+info.latitude-halfWidth) ])[0],
                                projection([ Number(+info.longitude+halfWidth), Number(+info.latitude+halfWidth) ])[0]
                              ]),
                          d3.max([
                                projection([ Number(+info.longitude-halfWidth), Number(+info.latitude-halfWidth) ])[1],
                                projection([ Number(+info.longitude+halfWidth), Number(+info.latitude+halfWidth) ])[1]
                              ]),
                        ]
                      ];

        zoomTo(bounds);
        
      }// end if ... 


    var sel = d3.selectAll( ".magnitudeLegend" );
    sel.moveToBack();
    var sel = d3.selectAll( ".depthLegend" );
    sel.moveToBack();


    return;

  }// end transitionEvents





  
    /*
      NAME:       zoomTo    
      DESCRIPTION:  called on page load to zoom to user-defined bounding box , defined by vis.onLoadVariables.vars.bounds
      CALLED FROM:  draw
      CALLS:      n/a   
      REQUIRES:     boundsSet - boundary information for area to zoom to.
      RETURNS:    n/a   
    */
    function zoomTo(boundsSet){
      
      // calculate key bounds information
      var bounds = [ (boundsSet[0]) , (boundsSet[1]) ],
            dx = bounds[1][0] - bounds[0][0],  
            dy = bounds[1][1] - bounds[0][1],  
            x = (bounds[0][0] + bounds[1][0])/2,  
            y = (bounds[0][1] + bounds[1][1])/2, 
            scale = .1/Math.max(dx/width, dy/tjb.height),
            translate = [(width*0.333)-scale*x, (tjb.height*0.66)-scale*y];   
    
      // modify vis.width of svg coastline
      parentG
        .transition()
        .duration(4000)
        .style("stroke-width", "0.5px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

      boundariesG
        .transition()
        .duration(4000)
        .style("stroke-width", "0.5px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

      platesG
        .transition()
        .duration(4000)
        .style("stroke-width", "0.5px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
    
      g.append("rect")
        .attr("class" , "masks horizontal")
        .attr("x", 0)    
        .attr("y", 0)
        .attr("width", d3.select("#mainSVG").attr("width") )
        .attr("height", d3.select( "#mainSVG" ).attr( "height" )*0.5)
        .style("fill","#000000")
        .style("fill-opacity", 0.925); 
      
      g.append( "rect" )
        .attr( "class" , "masks  vertical" )
        .attr( "x", d3.select( "#mainSVG" ).attr( "width" )*0.75 )   
        .attr( "y", 0 )
        .attr( "width" , d3.select( "#mainSVG" ).attr( "width" )*0.25 )
        .attr( "height" , d3.select( "#mainSVG" ).attr( "height" ) )
        .style( "fill" , "#000000" )
        .style( "fill-opacity", 1.0 );

      updateEventInformation();
      
      var sel = d3.selectAll( ".scroll" );
      sel.moveToFront();
      var sel = d3.selectAll( ".barcode.g" );
      sel.moveToFront();
      var sel = d3.selectAll( ".depth.axis" );
      sel.moveToFront();
      var sel = d3.selectAll( ".magnitudeLegend" );
      sel.moveToFront();
      var sel = d3.selectAll( ".depthLegend" );
      sel.moveToFront();
      var sel = d3.selectAll( ".highlight.highlight-g" );
      sel.moveToFront();
      var sel = d3.selectAll( ".highlightEpicentre" );
      sel.moveToFront();
      var sel = d3.selectAll( ".eventInfo.furtherDetails" );
      sel.moveToFront();

      return;
      
    }// end function zoomTo()






    function getByKey(key) {
      var found = null;

      for (var i = 0; i < tjb.earthquakes.length; i++) {
        var element = tjb.earthquakes[i];

          if (element.FID == key) {
            found = element;
          } 
      } 
      
      return found;

    }// end function getByKey





























































































  /**
   * DATA FUNCTIONS
   *
   * Used to coerce the data into the
   * formats we need to visualize
   *
   */

  /**
   * getWords - maps raw data to
   * array of data objects. There is
   * one data object for each word in the speach
   * data.
   *
   * This function converts some attributes into
   * numbers and adds attributes used in the visualization
   *
   * @param rawData - data read in from file
   */
  function getWords(rawData) {
    return rawData.map(function (d, i) {
      // is this word a filler word?
      d.filler = (d.filler === '1') ? true : false;
      // time in seconds word was spoken
      d.time = +d.time;
      // time in minutes word was spoken
      d.min = Math.floor(d.time / 60);

      // positioning for square visual
      // stored here to make it easier
      // to keep track of.
      d.col = i % numPerRow;
      d.x = d.col * (squareSize + squarePad);
      d.row = Math.floor(i / numPerRow);
      d.y = d.row * (squareSize + squarePad);
      return d;
    });
  }

  /**
   * getFillerWords - returns array of
   * only filler words
   *
   * @param data - word data from getWords
   */
  function getFillerWords(data) {
    return data.filter(function (d) {return d.filler; });
  }

  /**
   * getHistogram - use d3's histogram layout
   * to generate histogram bins for our word data
   *
   * @param data - word data. we use filler words
   *  from getFillerWords
   */
  function getHistogram(data) {
    // only get words from the first 30 minutes
    var thirtyMins = data.filter(function (d) { return d.min < 30; });
    // bin data into 2 minutes chuncks
    // from 0 - 31 minutes
    // @v4 The d3.histogram() produces a significantly different
    // data structure then the old d3.layout.histogram().
    // Take a look at this block:
    // https://bl.ocks.org/mbostock/3048450
    // to inform how you use it. Its different!
    return d3.histogram()
      .thresholds(xHistScale.ticks(10))
      .value(function (d) { return d.min; })(thirtyMins);
  }

  /**
   * groupByWord - group words together
   * using nest. Used to get counts for
   * barcharts.
   *
   * @param words
   */
  function groupByWord(words) {
    return d3.nest()
      .key(function (d) { return d.word; })
      .rollup(function (v) { return v.length; })
      .entries(words)
      .sort(function (a, b) {return b.value - a.value;});
  }

  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function (index) {
    activeIndex = index;

    ai = activeIndex;
    ti = index;
    li = lastIndex;

    if( index==0 ){ $(".up").addClass("disabled").removeClass("enabled"); }
    else{ $(".up").addClass("enabled").removeClass("disabled"); }

    if( index==7 ){ $(".down").addClass("disabled").removeClass("enabled"); }
    else{ $(".down").addClass("enabled").removeClass("disabled"); }

    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function (i) {
        activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
 /* chart.update = function (index, progress) {
    updateFunctions[index](progress);
  };*/

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {
    
  // create a new plot and
  // display it
  plot = scrollVis();
  d3.select('#vis')
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller().container(d3.select('#graphic'));
  scroll(d3.selectAll('.step'));
 
  // setup event handling
  scroll.on('active', function (index) {

    if( tjb.isReloaded==true ){
      index = 0;
      tjb.isReloaded=false;
    }
    else{
      index = index;
    }
    
    onScrolling(index);
  });
}

// load data and display
d3.tsv('data/words.tsv', display);


function onScrolling(index){    

    if( index>0 ){ $("#restart").removeClass("disabled").addClass("active"); }
    else if( index==0 ){
      d3.selectAll(".histo").remove();
      $("#restart").removeClass("active").addClass("disabled");
    }
    else{ }

    // highlight current step text on left side of browser window
    d3.selectAll('.step').style('opacity', function (d, i) { return i === index ? 1 : 0.1; });
    plot.activate(index);

  return;

}// end function onScrolling()


    function changeView(){
   
      if( $("#view").hasClass("nostory") ){
        console.log('sections have been hidden')
        d3.select("#sections").style("display" , "none");

        d3.select("#view").text("Show information panel");
        $("#view").removeClass("nostory").addClass("story");
        d3.selectAll(".scroll").style("display" , "inline");

        d3.select( "#vis" ).style( "width" , "100%" );
        d3.select( "#mainSVG" ).style( "width" , "100%" );
       // resizeAll();
      }
      else if( $("#view").hasClass("story") ){
        console.log('sections have been shown')
        d3.select("#sections").style("display" , "inline-block");
        d3.select("#view").text("Hide information panel");
        $("#view").removeClass("story").addClass("nostory");
        d3.selectAll(".scroll").style("display" , "none");

        d3.select( "#vis" ).style( "width" , "100%" );
        d3.select( "#mainSVG" ).style( "width" , "100%" );
      }
      else{

      }

     // tjb.changedView = true;

      return;

    }// end function clickButton()


    function changeHighlight(){


      //Add annotations
      var labels = [
      {
        data: { id:"id1" , date: "1960-05-22", magnitude: 9.5 , depth: 25 , location:"Bio-Bio, Chile" , furtherDetails:"" },
        dy: 0,
        dx: 0,
        note: { align: "middle" }
      },{
        data: { id:"id2" , date: "2011-03-11", magnitude: 9.1 , depth: 29 , location:"Fukushima, Japan" , furtherDetails:"" },
        dy: 0,
        dx: 0,
        note: { align: "middle" }
      },{
        data: { id:"id3" , date: "2004-12-26", magnitude: 9.1 , depth: 30 , location:"Sumatra, Indian Ocean" , furtherDetails:"" },
        dy: 0,
        dx: 0,
        note: { align: "middle" }
      },{
        data: { id:"id4" , date: "1964-03-28", magnitude: 9.2 , depth: 25 , location:"Southern Alaska" , furtherDetails:"" },
        dy: 0,
        dx: 0,
        note: { align: "middle" }
      },{
        data: { id:"id5" , date: "1952-11-04", magnitude: 9.0 , depth: 21.6 , location:"Kamchatka Peninsula, Russia" , furtherDetails:"" },
        dy: 0,
        dx: 0,
        note: { align: "middle" }
      },{
        data: { id:"id6" , date: "1985-09-19", magnitude: 8.0 , depth: 27.9 , location:"Michoacan, Mexico" , furtherDetails:"" },
        dy: 0,
        dx: 0,
        note: { align: "middle" }
      }
      ].map(function (l) {
        l.note = Object.assign({}, l.note, {
          title: l.data.location + " (" + (l.data.magnitude.toFixed(1)) + "M)"
        });
        l.subject = { radius: 4 };

        return l;
      });


      if( $("#highlight").hasClass("true") ){
        $("#highlight").removeClass("true").addClass("false");
        tjb.highlight = false;
        d3.select("#highlight").text("Show only large events");
      }
      else{
        $("#highlight").removeClass("false").addClass("true");
        tjb.highlight = true;
        d3.select("#highlight").text("Show all events");

        var HighlightIndex=0;

        console.log(tjb.slideCounter)

        if( ti==1 && tjb.slideCounter==1 ){

          window.makeAnnotations = d3.annotation().annotations(labels).type(d3.annotationCalloutElbow).accessors({

                                      x: function x(d) {
                                        
                                        var startYear = Math.floor(d.date.substring(0,4)/10)*10;
                                        var endYear = startYear+9;
                                        vis.index = (startYear-1900)/10;

                                        var xScaleMini = d3.scaleTime().range([0, +chartWidth-margin.left-margin.right]); 
                                        xScaleMini.domain([ parseTime(startYear+"-01-01") , parseTime(endYear+"-12-31") ]);

                                        d3.selectAll(".barcode.x.axis.minor.minor-"+vis.index)
                                                      .append("circle")
                                                      .attr("cx" , xScaleMini(parseTime(d.date)) )
                                                      .attr('cy', -chartHeight + yScaleMini(+d.depth)  ) 
                                                      .attr("r" , magScale(+d.magnitude)+2 )
                                                      .style("opacity" , 1.00)
                                                      .style("fill" , "none")
                                                      .style("stroke" , "#FFFFFF")
                                                      .style("stroke-width" , 1.5);
                                                      
                                          HighlightIndex++;

                                        return margin.left+xScaleMini(parseTime(d.date));
                                      },
                                      y: function y(d) {
                                       return yPlacements[vis.index]-chartHeight+yScaleMini(+d.depth);
                                       
                                      },
                                      "font-size": function y(d) {
                                        return "0.33rem";
                                      }
                                    });

          g.append("g").attr("class", "barcode annotations").call(makeAnnotations);

          $(".annotation").addClass(function(i){ return "annotationNumber-"+i; })
          $(".eventInfo furtherDetails").addClass(function(i){ return "furtherDetails-"+i; })
          d3.selectAll(".annotation").style("opacity" , 1.0);

          var sel = d3.selectAll(".barcode.annotations");
          sel.moveToFront();
          var sel = d3.selectAll(".barcode.x.axis.minor");
          sel.moveToFront();

        }
      }

      tjb.earthquakes.forEach(function(d,i){

        g.selectAll(".epicentres.events.b" + d.FID)
          .style("stroke-opacity", function(d,i){
            if( tjb.highlight==false ){ return 1.00; }
            else{
              if( d.mag<8.0 ){ return 0.0; }
              else{ return 1.00; }
            }
          })
          .style("fill-opacity", function(d,i){
            if( tjb.highlight==false ){ return 0.66; }
            else{
              if( d.mag<8.0 ){ return 0.0; }
              else{ return 0.66; }
            }
          })
          .style("opacity", 1.00 );
      })

      return;

    }// end function changeHighlight()


  function refresh(){

    if( $("#restart").hasClass("active") ){
      $("#restart").removeClass("active").removeClass("disabled");
      location.reload(); 
    }

    return;

  }// end function refresh()



  //check for Navigation Timing API support
  if (window.performance) {
    //console.info("window.performance works fine on this browser");
  }
  if (performance.navigation.type == 1) {
    tjb.isReloaded = true;
    console.info( "This page is reloaded: " + tjb.isReloaded );
  } else {
  }







  function showHistogramChart(){


    d3.selectAll(".basehrects").remove();
    d3.selectAll(".hrects").remove();
    d3.selectAll(".xAxis.axis.histo").remove();
    d3.selectAll(".yAxis.axis.histo").remove();

    chartWidth = d3.select("#vis").style("width").replace("px",'');
    histoHeight = (tjb.height*0.8)-(tjb.height*0.6);

    x = d3.scaleLinear().domain([ 7 , 10 ]).range([ 0 , chartWidth-margin.left-margin.right ]);
    histo_xAxis = g.append("g")
        .style("opacity" , 1.0)
        .attr("class" , "xAxis axis histo")
        .attr("transform", 'translate(' + margin.left + ', ' + ((tjb.height*0.6)+histoHeight) + ')');        
    histo_xAxis.selectAll(".tick text").text(function(d){ return d.toFixed(1) + "M"; })
    histo_xAxis.call(d3.axisBottom(x).tickFormat(d3.format(".1f")))


     // A function that builds the graph for a specific value of bin
    function update(nBin) {

      var colours = [ "#006837",
                        "#096336",
                        "#115d35",
                        "#1a5834",
                        "#235233",
                        "#2b4d33",
                        "#344732",
                        "#3d4231",
                        "#453c30",
                        "#4e372f",
                        "#57312e",
                        "#602c2d",
                        "#68262c",
                        "#71212b",
                        "#7a1b2a",
                        "#82162a",
                        "#8b1029",
                        "#940b28",
                        "#9c0527",
                        "#a50026"];


      // set the parameters for the histogram
      var histogram = d3.histogram()
          .value(function(d) { return +d.mag; })   // I need to give the vector of value
          .domain(x.domain())  // then the domain of the graphic
          .thresholds(x.ticks(nBin)); // then the numbers of bins

      // And apply this function to data to get the bins
      bins = histogram(tjb.earthquakes);


      // Join the rect with the bins data
      var u = histo_xAxis.selectAll(".hrects").data(bins)

      y = d3.scaleLinear().range([histoHeight, 0]);
      y.domain([0, Math.ceil((d3.max(bins, function(d) { return d.length; })) / 100) * 100    ]);   // d3.hist has to be called before the Y axis obviously
    
      var yAxis = g.append("g")
          .style("opacity" , 1.0)
          .attr("class" , "yAxis axis histo")
          .attr("transform", 'translate(' + (margin.left) + ', ' + ((tjb.height*0.8)-histoHeight) + ')');
      // Y axis: initialization
      yAxis.call(d3.axisLeft(y));

      mainGraphBottom_yticks = g.selectAll('.yAxis.axis.histo').selectAll('.tick');          
      mainGraphBottom_yticks.append('svg:line')
        .attr( 'class' , "mainGraphBottom_yticks" )
        .attr( 'id' , "yAxisTicks" )
        .attr( 'y0' , 0 )
        .attr( 'y1' , 0 )
        .attr( 'x1' , chartWidth-margin.left-margin.right )
        .attr( 'x2' , 0 )
        .style("opacity" , 0.333)
        .style("stroke-width" , "1.0px")
        .style("fill" , "none")
        .style("stroke" , "#A0A0A0");

      // Manage the existing bars and eventually the new ones:
      u.enter()
        .append("rect") // Add a new rect for each new elements 
        .attr("class" , "basehrects")
        .merge(u) // get the already existing elements as well
        .transition() // and apply changes to all of them
        .duration(0)
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + (-histoHeight) + ")"; })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
        .style("stroke-opacity", 1.00)
        .style("fill-opacity", 0.66)
        .style("opacity", 1.0)
        .transition() // and apply changes to all of them
        .duration(0)
          .attr("class" , "hrects")
          .attr("x", 1)
          .attr("y", function(d) { return y(d.length); })
          .attr("height", function(d) { return histoHeight - y(d.length); })
          .style("stroke-width", "1.25px")
          .style("stroke", function(d,i){ return "#abcdef" /*colours[i]*/; })
          .style("fill", function(d,i){ return "#abcdef" /*colours[i]*/; })

      // If less bar in the new histogram, I delete the ones not in use anymore
      u
          .exit()
          .remove()
        
      d3.selectAll(".yAxis.axis.histo text").attr("x" , "-15").style("opacity" , 1.0).style("text-anchor" , "end");    
      d3.selectAll('.yAxis.axis.histo').append("text").attr("class" , "yAxisTitle major" ).attr("x" , 0).attr("y" , -25)/*.style("font-size" , "16px")*/.text("Number")

      var sel = d3.selectAll(".xAxis.axis.histo");
      sel.moveToFront();

    }


    // Initialize with 20 bins
    update(24);

    return;

  }// end function showHistogramChart





  function drawDepthLegend(){

    d3.selectAll( ".legendD" ).remove();
    d3.select( "#depthLegendrect" ).remove();

    var depths = [ 0, 100 , 300, 700 ];
    
    depthLegend = d3.select("#depthLegendH")
      .attr( "x" , 0 )
      .attr( "y" , (tjb.height*0.5) )
      .attr("width" , d3.select( "#sections" ).style( "width" ) )
      .attr("height" , 150)
      .style("background" , "#000000" )
      .attr("fill-opacity" , 0.5)
      .style("position" , "fixed" )
      .style("bottom" , "300px" )
      .style("opacity" , 1.0 );

    var w = depthLegend.attr("width").replace( "px" , '' );
    var h = depthLegend.attr("height").replace( "px" , '' );

    var svgDefs = depthLegend.append('defs').attr( "class" , "legendD" );

    var mainGradient = svgDefs.append('linearGradient')
        .attr( "class" , "legendD" )
        .attr('id', 'mainGradient');

     mainGradient.append('stop')
        .attr('class', 'stop-left legendD')
        .attr('offset', '0');

    mainGradient.append('stop')
        .attr('class', 'stop-step1 legendD')
        .attr('offset', '0.25');

    mainGradient.append('stop')
        .attr('class', 'stop-step2 legendD')
        .attr('offset', '0.5');

    depthLegend.append("text")
      .attr( "class" , "legendD" )
      .attr("x" , w*0.5 )
      .attr("y" , h*0.95 )
      .style("fill" , "#FFFFFF")
      .style("stroke" , "none")
      .style("stroke-width" , "0.5px")
      .style("font-size" , "12px")
      .style("text-anchor" , "middle")
      .text("Depth (km)");

    depthLegend.append( "rect" )
      .classed( "filled" , true )
      .attr( "id" , "depthLegendrect" )
      .attr( "x" , w*0.10 )
      .attr( "y" , h*0.5 )
      .attr( "width" , w*0.7 )
      .attr( "height" , h*0.15 )
      .style( "fill-opacity" , 0.5 )
      .style( "stroke" , "#FFFFFF" )
      .style( "stroke-width" , "0.5px" );

    depthLegend.append( "line" )
      .attr( "x1" , 0 )
      .attr( "y1" , 0 )
      .attr( "x2" , w )
      .attr( "y2" , 0 )
      .attr( "width" , w )
      .attr( "height" , 2 )
      .style( "fill-opacity" , 1.0 )
      .style( "fill" , "#FFFFFF" )
      .style( "stroke" , "#FFFFFF" )
      .style( "stroke-width" , "2.5px" )
      .style( "stroke-linecap" , "round" );

    var rectW = d3.select( "#depthLegendrect" ).attr( "width" );
    var rectH = d3.select( "#depthLegendrect" ).attr( "height" );

    depths.forEach(function(d,i){

      depthLegend.append("rect")
        .attr( "class" , "legendD" )
        .attr("x" , (w*0.10+(rectW/700)*d) )
        .attr("y" , (h*0.5) )
        .attr("width" , 1)
        .attr("height" , (h*0.15)+5 )
        .style("fill-opacity" , 1.0)
        .style("fill" , "#FFFFFF")
        .style("stroke-width" , 0.5);

      depthLegend.append("text")
       .attr( "class" , "legendD" )
        .attr("x" , (w*0.1+(rectW/700)*d) )
        .attr("y" , (h*0.75) )
        .attr("width" , 1)
        .attr("height" , 5 )
        .style("fill-opacity" , 1.0)
        .style("fill" , "#FFFFFF")
        .style("stroke" , "none")
        .style("stroke-width" , "0.5px")
        .style("font-size" , "8px")
        .style("text-anchor" , "middle")
        .text(d);
    })

    return;

  }// end function drawDepthLegend()






  function drawFaultsLegend(){

    faultLegend = g.append("svg")
      .attr( "class" , "faultsLegend visLegend" )
      .attr( "id" , "faultsLegend" )
      .attr( "x" , d3.select("#mainSVG").attr("width").replace("px",'')*0.5 )
      .attr( "y" , d3.select("#mainSVG").attr("height").replace("px",'')*0.1  )
      .attr("width" , 200 )
      .attr("height" , 75 )
      .attr("fill-opacity" , 0.5)
      .style("background" , "#000" )
      .style("opacity" , 1.0 );

    var w = d3.select( "#faultsLegend" ).attr( "width" ).replace( "px" , '' );
    var h = d3.select( "#faultsLegend" ).attr( "height" ).replace( "px" , '' );

    faultLegend.append("text")
      .attr( "class" , "legendF" )
      .attr("x" , w*0.5 )
      .attr("y" , h*0.95 )
      .style("fill" , "#FFFFFF")
      .style("stroke" , "none")
      .style("stroke-width" , "0.5px")
      .style("font-size" , "1.0rem")
      .style("text-anchor" , "middle")
      .text("Fault Types");

    faults.forEach(function(d,i){

      faultLegend.append("g")
        .attr("class" , "g"+d)
        .attr("transform" , "translate(" + parseFloat((0)+(i*(w/faults.length+1))) + "," + (h*0.5) + ")")

      d3.selectAll(".g"+d)
        .append("text")
        .attr("x" , 0 )
        .attr("y" , 0 )
        .style("fill" , "#FFFFFF")
        .style("stroke" , "none")
        .style("stroke-width" , "1.0px")
        .style("font-size" , "1.0rem")
        .style("text-anchor" , "start")
        .text("Fault Types")
        .text(d);

      d3.selectAll(".g"+d)
        .append("line")
        .attr("class" , "faultLine "+d)
        .attr("x1" , 0 )
        .attr("y1" , h*0.1 )
        .attr("x2" , 50 )
        .attr("y2" , h*0.1 );

    })// end for loop

    return;

  }// end function drawFaultsLegend 





  function drawMagLegend(){

    d3.selectAll( ".legendM" ).remove();

    var mags = [ 7, 8, 9, 10 ];

    magnitudeLegend = d3.select( "#magnitudeLegend" )
      .attr( "x" , 0 )
      .attr( "y" , (tjb.height*0.75) )
      .attr("width" , d3.select( "#sections" ).style( "width" ) )
      .attr("height" , 150 )
      .attr("fill-opacity" , 0.5)
      .style("background" , "#000" )
      .style("position" , "fixed" )
      .style("bottom" , "150px" )
      .style("opacity" , 1.0 );

    var w = d3.select( "#magnitudeLegend" ).attr( "width" ).replace( "px" , '' );
    var h = d3.select( "#magnitudeLegend" ).attr( "height" ).replace( "px" , '' );

    magnitudeLegend.append("text")
      .attr( "class" , "legendM" )
      .attr("x" , w*0.5 )
      .attr("y" , h*0.95 )
      .style("fill" , "#FFFFFF")
      .style("stroke" , "none")
      .style("stroke-width" , "0.5px")
      .style("font-size" , "12px")
      .style("text-anchor" , "middle")
      .text("Magnitude (M)");

    mags.forEach(function(d,i){

      magnitudeLegend.append("circle")
        .attr( "class" , "legendM" )
        .attr("cx" , w*0.33 )
        .attr("cy" , h*0.75-magScale(d) )
        .attr("r" , magScale(d))
        .style("fill" , "#e3692f")
        .style("stroke" , "#e3692f")
        .style("stroke-width" , "1.5px")
        .style("stroke-opacity" , 1.0)
        .style("fill-opacity" , 0.5)
        .style("opacity" , 0.5);

      magnitudeLegend.append("line")
        .attr( "class" , "legendM" )
        .attr("x1" , w*0.33)
        .attr("y1" , h*0.75-(magScale(d)*2) )
        .attr("x2" , w*0.66+10 )
        .attr("y2" , h*0.75-(magScale(d)*2) )
        .style("fill" , "#e3692f")
        .style("stroke" , "#e3692f")
        .style("stroke-width" , "1.5px")
        .style("opacity" , 0.5);

      magnitudeLegend.append("text")
        .attr( "class" , "legendM" )
        .attr("x" , w*0.66+10 )
        .attr("y" , h*0.75-(magScale(d)*2)-2 )
        .style("fill" , "#FFFFFF")
        .style("stroke" , "none")
        .style("stroke-width" , "0.5px")
        .style("font-size" , "8px")
        .style("text-anchor" , "end")
        .text(d.toFixed(1)+"M");
    })

    return;

  }// end function drawMagLegend



  function getButtonDimensions(){

    if( tjb.mediaType=="mobile" ){ return 10; }
    else if( tjb.mediaType=="tablet" ){ return 20; }
    else if( tjb.mediaType=="desktop" ){ return 30; }

    else { return -1; }

  }// end function getButtonDimensions
  





