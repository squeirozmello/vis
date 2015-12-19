'use strict';
var VIS = VIS || {};

VIS.questionOne = {
    
    el: 'body',

    initialize: function(){
        var that = this;

        this.drawGraph('0','INDEX_GDAXI');

        $('.options').change(function(){
            var index1 = $('#options').val(),
                index1_text = VIS.globals.indexName[index1],
                file1 = VIS.globals.indexes[index1];
                that.drawGraph('0',file1);
                that.setLegend(index1_text);
                that.updateGraph();
        });
    },
    
    setLegend: function(index1){
        $('#index_title-1').text(index1);
    },

    drawGraph: function(index,url,index2,url2,start_date,end_date) {
        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var parseDate = d3.time.format('%Y-%m-%d').parse;

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

        var lineOne = d3.svg.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.close); });

        var lineTwo = d3.svg.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.close); });

        var svg = d3.select('.graph-box').append('svg')
            .attr('class', 'svg-style')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        d3.json('.\\corr.json', function(error, data) {
          
            if (error) throw error;

            data.forEach(function(d) {
                
            });

            x.domain(d3.extent(data, function(d) { 
                return 1;
            }));
            y.domain(d3.extent(data, function(d) { return 1 }));

            svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end");

            svg.append("line")
                .attr("x1","150")
                .attr("x2", "150")
                .attr("y1", "0")
                .attr("y2", "450")
                .attr("stroke","black")
                .attr("stroke-width","2");

            svg.append("line")
                .attr("x1","850")
                .attr("x2", "850")
                .attr("y1", "0")
                .attr("y2", "450")
                .attr("stroke","black")
                .attr("stroke-width","2");

            svg.append("line")
                .attr("x1","450")
                .attr("x2", "450")
                .attr("y1", "0")
                .attr("y2", "450")
                .attr("stroke","black")
                .attr("stroke-width","2");

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end");

            svg.append('path')
              .datum(data)
              .attr('class', 'line-one')
              .attr('d', lineOne);

        });

    }
};

VIS.questionOne.initialize();