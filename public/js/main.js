var svgHeight    = parseInt(window.innerHeight)
  , svgWidth     = parseInt(window.innerWidth)
  , barPadding   = 1
  , hPad         = 250
  , vPad         = 250
  , xScale       = d3.time.scale()
  , hScale       = d3.time.scale()
  , yScale       = d3.scale.linear()
  , yAxisScale   = d3.scale.linear()
  , vScale       = d3.scale.linear()
  , vHeightScale = d3.scale.linear()
  , xAxis
  , yAxis
  , maxHeight
  , parsedData
  , curColor
  , curDev
  , overXScale = d3.scale.linear()
  , overHScale = d3.scale.linear()
  , overYScale = d3.scale.linear()
  , overVScale = d3.scale.linear()
  , overXAxis
  , overYAxis

  , setMaxHeight = function(data,value){
  	if(typeof value === 'undefined'){value = 0};
  	if(data.length){
  		var working = d3.max(data.shift());
  		if(working > value){
  			return setMaxHeight(data,working);
  		}
  		return setMaxHeight(data,value)
  	}
  	else{
  		return value;
  	};
  }
  , calculateStandardDeviation = function(dataArr,i){
		var sum  = d3.sum(dataArr)
		  , mean = d3.mean(dataArr)
		  , sqOfDiffs = dataArr.map(function(data){
		  	return Math.pow(data - mean,2);
		  })
		  , sumOfDiffSq = d3.sum(sqOfDiffs) / dataArr.length
		  , extent      = d3.extent(dataArr)
		  , min         = extent[0]
		  , max         = extent[1]
		  , returnValue = Math.sqrt(sumOfDiffSq);
	  return  returnValue;
	}
  , buildHistogram = function(data){
	parsedData = JSON.parse(data);
	window.data = parsedData;
	// $.each(parsedData,function(){
	// 	this.sort(d3.ascending);
	// });
	var container   = d3.select('.container')
	  , svg         = container.append('svg')
	  					.attr('class','graphville')
	  , rangeBars   = svg.selectAll('rect.range')
		  			   .data(parsedData)
		  			   .enter()
		  			   .append('rect')
	  , medianBars  = svg.selectAll('rect.median')
		  			   .data(parsedData)
		  			   .enter()
		  			   .append('rect')
	  , meanBars    = svg.selectAll('rect.mean')
		  			   .data(parsedData)
		  			   .enter()
		  			   .append('rect')
	  , deviantBars = svg.selectAll('rect.deviant')
		  			   .data(parsedData)
		  			   .enter()
		  			   .append('rect')
	  , maxText     = svg.selectAll('text.max')
		  			   .data(parsedData)
		  			   .enter()
		  			   .append('text')
	  , minText     = svg.selectAll('text.min')
		  			   .data(parsedData)
		  			   .enter()
		  			   .append('text');
	svg.attr('width',svgWidth)
	   .attr('height',svgHeight);
	buildBars({
		el      : rangeBars,
		x       : xAlign,
		y       : function(d,i){
			var max = d3.max(d)
			  , returnValue = yScale(max) - vPad / 2;
			return returnValue;
		},
		height  : function(d,i){
			var extent      = d3.extent(d)
			  , rangeHeight = vScale(extent[1] - extent[0]);
			return rangeHeight;
		},
		width   : calculateWidth,
		fill    : function(d){
			var extent = d3.extent(d)
			  , range = extent[1] - extent[0]
			  , asDecimal = 1 - ( range / maxHeight )
			  , asPercent = Math.floor( asDecimal * 100 ) + '%'
			  , asString = 'hsl(180,' + asPercent + ',50%)';
			return asString;
		},
		opacity : .4,
		class   : 'range',
		event   : {
			handler : rangeOver,
			type    : 'mouseover'
		}
	});
	// buildBars({
	// 	el      : meanBars,
	// 	x       : xAlign,
	// 	y       : function(d,i){
	// 		return yScale(d3.mean(d));
	// 	},
	// 	height  : 2,
	// 	width   : calculateWidth,
	// 	fill    : 'red',
	// 	opacity : .75,
	// 	class   : 'mean',
	// });
	svg.append('g')
	   .attr('class','y-axis')
	   .attr("transform", "translate(" + hPad + ",0)")
	   .call(yAxis);
	svg.append('g')
	   .attr('class','x-axis')
	   .attr("transform", "translate(0," + ( svgHeight - vPad / 2 ) + ")")
	   .call(xAxis);
	}
, xAlign = function(d,i){
		return ( i * ( ( svgWidth - ( hPad * 2 ) ) / parsedData.length ) ) + ( hPad );
		// return xScale( i * ( svgWidth - ( hPad * 2 ) ) / numberOfBars );
	}
, calculateWidth = function(d){
		return ( ( svgWidth - ( hPad * 2 ) ) / parsedData.length) - barPadding 
	}
, rangeOver = function(d,i){
		curColor = d3.hsl(d3.select(d3.event.currentTarget).attr('fill'));
		var brighter = curColor.brighter(1);
		d3.select(d3.event.currentTarget).attr('fill',brighter).on('mouseout',rangeOut).on('mousemove',modOverlay);
		launchOverlay(d,d3.event);
	}
, rangeOut = function(){
		d3.select(d3.event.currentTarget).attr('fill',curColor).on('mouseout',null);
		destroyOverlay(d3.event)
	}
, buildBars = function(_attrs){
		var el = _attrs.el;
		el.attr('y'       , _attrs.y)
		  .attr('x'       , _attrs.x)
		  .attr('height'  , _attrs.height)
		  .attr('width'   , _attrs.width)
		  .attr('opacity' , _attrs.opacity)
		  .attr('class'   , _attrs.class)
		  .attr('fill'    , _attrs.fill)
		if(typeof _attrs.event !== 'undefined'){
			el.on(_attrs.event.type,_attrs.event.handler);
		}
	}
, launchOverlay = function(d,evt){
		var svg = d3.select('svg.graphville')
		  , countArr = countArray(d)
		  , hist = svg.append('g')
		  			.data(countArr)
		  			.attr('class','hist')
					.attr('transform','translate(' + ( ( d3.event.pageX  ) + 150  ) + ',' + ( d3.event.pageY - 150 ) + ')')
		  			.attr('height',250)
		  			.attr('width',250)
		  , rect = hist.append('rect')
		  			.attr('class','stage')
		  			.attr('fill',"#FFFFFF")
		  			.attr('stroke','#CCCCCC')
		  			.attr('height',250)
		  			.attr('width',250)
		  , constructBars = function(){
		  		hist.append('rect')
		  			.attr('width',10)
		  			.attr('height',function(){
		  				return ( 250 / countArr.length ) + 9
		  			})
		  			.attr('class','stage-bar')
		  			.attr('x',function(d,i){
		  				console.log(d);
		  				return ( i * ( 250 / countArr.length ) ) + 9;
		  			})
		  			.attr('y',10)
					.attr('fill','red');
				// debugger;
			};
		$('g.hist').css('top',window.innerHeight * -1);

		hist.append('g')
		   .attr('class','y-axis')
		   .call(overYAxis);
		hist.append('g')
		   .attr('class','x-axis')
		   .attr("transform", "translate(0,250)")
		   .call(overXAxis);
		constructBars();
	}
, modOverlay = function(d){
		d3.select('g.hist')
			.attr('transform','translate(' + ( ( d3.event.pageX  ) + 50  ) + ',' + ( d3.event.pageY - 75 ) + ')')
	}
, destroyOverlay = function(d){
		d3.select('g.hist').remove();
	}

, countArray = function(_arr) {
    var values = []
      , counts = []
      , prev;
    _arr.sort(d3.ascending);
    for ( var i = 0; i < _arr.length; i++ ) {
        if ( _arr[i] !== prev ) {
            values.push(_arr[i]);
            counts.push(1);
        } else {
            counts[counts.length-1]++;
        }
        prev = _arr[i];
    }
    console.log([values,counts]);
    return [values, counts];
}
$(document).ready(function(){
	console.time('total draw');
	console.time('get data');
	data = [];
	$.ajax({
		type:'GET',
		url:'/data',
		success:function(data){
			console.timeEnd('get data');
			console.time('render');
			console.log(data);
			maxHeight = setMaxHeight(JSON.parse(data));
			numberOfBars = JSON.parse(data).length;

			yScale.domain([0,10000]);
			vScale.domain([0,10000]);
			vHeightScale.domain([0,10000]);

			xScale.domain([0,numberOfBars]);
			hScale.domain([0,numberOfBars]);

			yScale.range([svgHeight- vPad,vPad]);
			yAxisScale.range([svgHeight - ( vPad / 2 ),( vPad / 2 )])
			vScale.range([vPad,svgHeight - vPad]);
			vHeightScale.range([( vPad / 2 ),svgHeight - ( vPad / 2 )])

			xScale.range([svgWidth - hPad,hPad]);
			hScale.range([hPad,svgWidth - hPad])

			xAxis = d3.svg.axis().scale(hScale).orient('bottom');
			yAxis = d3.svg.axis().scale(yAxisScale).orient('left');

			overXScale.domain([0,10000]).range([0,250]);
			overYScale.domain([numberOfBars,0]).range([0,250]);

			overXAxis = d3.svg.axis().scale(overXScale).orient('bottom').ticks(2);
			overYAxis = d3.svg.axis().scale(overYScale).orient('left');

			buildHistogram(data);
			console.log('number of bars: ' + data.length);
			console.timeEnd('render');
		}
	});
});