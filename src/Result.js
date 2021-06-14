import React, { Component } from "react";
import * as d3 from "d3";
import { jStat } from "jstat";

const width = 440;
const height = 340;
const margin = { top: 20, right: 5, bottom: 25, left: 35 };

const Random_normal_Dist = (mean, sd) => {
  const data = [];
  for (let i = mean - 6 * sd; i < mean + 6 * sd; i += 0.0005) {
    const q = i;
    const p = jStat.normal.pdf(i, mean, sd);
    const arr = {
      q: q,
      p: p,
    };
    data.push(arr);
  }
  return data;
};

const calculateData = (rowData) => {
  console.log(rowData);
  const [min, max] = d3.extent(rowData);
  const mean = d3.mean(rowData);
  const stdev = d3.deviation(rowData);

  const usl = mean * 1.5;
  const lsl = mean * 0.5;
  const cpk = Math.min((usl - mean) / (3 * stdev), (mean - lsl) / (3 * stdev));
  console.log(min, max, mean, stdev, usl, lsl, cpk);
  return { min, max, mean, stdev, usl, lsl, cpk, rowData };
  //  this.drawSvg({ min, max, mean, stdev, ucl, lcl, usl, lsl, rowData });
};

const calculateNormalDistribution = (cpkdata) => {
  const normal = Random_normal_Dist(cpkdata.mean, cpkdata.stdev);
  console.log(normal);

  const xScale = d3
    .scaleLinear()
    .rangeRound([margin.left, width - margin.left]);

  //Min q
  const minQ = d3.min(normal, function (d) {
    return d.q;
  });

  //Max q
  const maxQ = d3.max(normal, function (d) {
    return d.q;
  });

  //Max p
  const maxP = d3.max(normal, function (d) {
    return d.p;
  });

  xScale.domain([minQ, maxQ]);

  const yScale = d3
    .scaleLinear()
    .domain([0, maxP])
    .range([height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .x(function (d) {
      return xScale(d.q);
    })
    .y(function (d) {
      return yScale(d.p);
    });
  return line(normal);
};

class App extends Component {
  // state = {
  //   data: [],
  //   cpkdata: {
  //     max: 0,
  //     min: 0,
  //     mean: 0,
  //     stdev: 0,
  //     ucl: 0,
  //     lcl: 0,
  //     usl: 0,
  //     lsl: 0,
  //   },
  //   bins: [],
  //   scaleX: null,
  //   scaleY: null,
  //   bars: [],
  //   paths: [],
  //   uslLine: null,
  //   lslLine: null,
  //   uslText: null,
  //   lslText: null,
  // };

  state = {};

  xAxis = React.createRef();
  // yAxis = React.createRef();
  static getDerivedStateFromProps(nextProps) {
    /* <Result data={whatever data is}/>*/
    const { data } = nextProps;
    if (!data) return {};

    const value = data.map((i) => parseFloat(i["Height(um)"]) || 0.0);
    const cpkdata = calculateData(value);

    const scaleX = d3
      .scaleLinear()
      .domain([
        Math.max(cpkdata.mean - cpkdata.stdev * 8, 0),
        cpkdata.mean + cpkdata.stdev * 8,
      ])
      .range([margin.left, width - margin.left]);

    // console.log(scaleX(cpkdata.mean));

    const histogram = d3
      .histogram()
      .value((d) => d) // I need to give the vector of value
      .domain(scaleX.domain()) // then the domain of the graphic
      .thresholds(scaleX.ticks(70));

    const bins = histogram(cpkdata.rowData);

    const scaleY = d3.scaleLinear().range([height - margin.bottom, margin.top]);
    scaleY.domain([0, d3.max(bins, (d) => d.length)]);
    //  console.log(bins);

    const bars = bins.map((d) => {
      return {
        x: scaleX(d.x0),
        y: scaleY(d.length),
        height: height - scaleY(d.length) - margin.bottom,
        width: 7,
        fill: "#6FA4E3",
      };
    });

    const paths = calculateNormalDistribution(cpkdata);

    const uslLine = {
      x1: scaleX(cpkdata.usl),
      y1: height - margin.bottom,
      x2: scaleX(cpkdata.usl),
      y2: margin.top,
    };

    const lslLine = {
      x1: scaleX(cpkdata.lsl),
      y1: height - margin.bottom,
      x2: scaleX(cpkdata.lsl),
      y2: margin.top,
    };

    const uslText = { x: scaleX(cpkdata.usl), y: margin.top };
    const lslText = { x: scaleX(cpkdata.lsl), y: margin.top };

    // this.setState({
    //   bars,
    //   scaleX,
    //   scaleY,
    //   paths,
    //   uslLine,
    //   lslLine,
    //   uslText,
    //   lslText,
    // });

    return {
      bars,
      scaleX,
      scaleY,
      paths,
      uslLine,
      lslLine,
      uslText,
      lslText,
    };
  }

  componentDidMount() {
    this.createAxis();
  }
  componentDidUpdate() {
    this.createAxis();
  }

  createAxis = () => {
    //  const { scaleX, scaleY } = this.state;
    const { scaleX } = this.state;
    let xAxisD3 = d3.axisBottom();
    // let yAxisD3 = d3.axisLeft().tickFormat((d) => d);

    xAxisD3.scale(scaleX);

    if (this.xAxis.current) {
      d3.select(this.xAxis.current).call(xAxisD3);
    }

    // yAxisD3.scale(scaleY);

    // if (this.yAxis.current) {
    //   d3.select(this.yAxis.current).call(yAxisD3);
    // }
  };

  render() {
    const { bars, paths, uslLine, lslLine, uslText, lslText } = this.state;
    return bars ? (
      <svg width={width} height={height}>
        {bars.length
          ? bars.map((d, i) => (
              <rect
                key={i}
                x={d.x}
                y={d.y}
                width={d.width}
                height={d.height}
                fill={d.fill}
                strokeWidth={"1px"}
                stroke={"#000"}
                // strokeWidth:3;stroke:rgb(0,0,0)"
              />
            ))
          : null}

        <path
          d={paths}
          fill={"none"}
          stroke={"#920e0e"}
          strokeWidth={"1.5px"}
          strokeDasharray={"8"}
          shapeRendering={"crispEdges"}
        />
        {uslLine ? (
          <line
            x1={uslLine.x1}
            y1={uslLine.y1}
            x2={uslLine.x2}
            y2={uslLine.y2}
            stroke={"#ff0000"}
            strokeWidth={"1.5px"}
          />
        ) : null}
        {lslLine ? (
          <line
            x1={lslLine.x1}
            y1={lslLine.y1}
            x2={lslLine.x2}
            y2={lslLine.y2}
            stroke={"#ff0000"}
            strokeWidth={"1.5px"}
          />
        ) : null}
        {uslText ? (
          <text x={uslText.x} y={uslText.y}>
            USL
          </text>
        ) : null}
        {lslText ? (
          <text x={lslText.x} y={lslText.y}>
            LSL
          </text>
        ) : null}

        <g
          ref={this.xAxis}
          transform={`translate(0, ${height - margin.bottom})`}
        />
        {/* <g ref={this.yAxis} transform={`translate(${margin.left}, 0)`} /> */}
      </svg>
    ) : null;
  }
}

export default App;

// handleCSV = (e) => {
//   d3.csv(URL.createObjectURL(e.target.files[0])).then((d) => {
//     console.log("start parsing");
//     const value = d.map((i) => i.value);
//     console.log(value);

//     this.calculateData(value);
//   });
// };

// calculateData = (rowData) => {
//   const [min, max] = d3.extent(rowData);
//   const mean = d3.mean(rowData);
//   const stdev = d3.deviation(rowData);
//   const ucl = mean + 3 * stdev;
//   const lcl = mean - 3 * stdev;
//   const usl = mean + 4 * stdev;
//   const lsl = mean - 4 * stdev;
//   const cpk = Math.min(
//     (usl - mean) / (3 * stdev),
//     (mean - lsl) / (3 * stdev)
//   );
//   console.log(min, max, mean, stdev, ucl, lcl, usl, lsl, cpk);
//   //  this.drawSvg({ min, max, mean, stdev, ucl, lcl, usl, lsl, rowData });
// };

/* find the x axis scale */
// const x = updateData.map((d) => d.unit);
// const xScale = d3
//   .scaleBand()
//   .domain(x)
//   .range([margin.left, width - margin.left]);
// /* find the y axis scale */
// const [min, max] = d3.extent(updateData, (d) => d.yield);
// const yScale = d3
//   .scaleLinear()
//   .domain([Math.min(min, 90), max])
//   .range([height - margin.bottom, margin.top]);
// /* find the right y axis scale */
// const [yMin, yMax] = d3.extent(updateData, (d) => d.total);
// const yScaleRight = d3
//   .scaleLinear()
//   .domain([Math.min(100, yMin), yMax + 1000])
//   .range([height - margin.bottom, margin.top]);
// /* calculate the path data by using d3 line() */
// const trend = d3
//   .line()
//   .x((d) => xScale(d.unit) + 20)
//   .y((d) => yScale(d.yield));

// const line = trend(updateData);

// /* calculate yield rate text */
// const labels = updateData.map((d) => ({
//   x: xScale(d.unit) + 20,
//   y: yScale(d.yield),
//   fill: "#6eae3e",
//   text: `${d.yield}%`,
// }));

// /* calculate production output total text */
// const textLabels = updateData.map((d) => ({
//   x: xScale(d.unit) + 7 - barPadding,
//   y: yScaleRight(d.total),
//   text: d.total,
// }));

// /* calculate the bar for plotting*/
// const bars = updateData.map((d) => {
//   return {
//     x: xScale(d.unit) + 7,
//     y: yScaleRight(d.total),
//     height: height - yScaleRight(d.total) - margin.bottom,
//     width: width / updateData.length - 18, // the width could be optimized a bit
//     fill: "#6FA4E3",
//   };
// });

// const passedLineHight = yScale(98);

// drawSvg = (cpkdata) => {
//   const scaleX = d3
//     .scaleLinear()
//     .domain([
//       Math.max(cpkdata.mean - cpkdata.stdev * 6, 0),
//       cpkdata.mean + cpkdata.stdev * 6,
//     ])
//     .range([margin.left, width - margin.left]);

//   console.log(scaleX(cpkdata.mean));

//   const histogram = d3
//     .histogram()
//     .value((d) => d) // I need to give the vector of value
//     .domain(scaleX.domain()) // then the domain of the graphic
//     .thresholds(scaleX.ticks(70));

//   const bins = histogram(cpkdata.rowData);

//   const scaleY = d3.scaleLinear().range([height - margin.bottom, margin.top]);
//   scaleY.domain([0, d3.max(bins, (d) => d.length)]);
//   console.log(bins);

//   const bars = bins.map((d) => {
//     return {
//       x: scaleX(d.x0),
//       y: scaleY(d.length),
//       height: height - scaleY(d.length) - margin.bottom,
//       width: 3,
//       fill: "#6FA4E3",
//     };
//   });

//   const paths = this.calculateNormalDistribution(cpkdata);

//   const uslLine = {
//     x1: scaleX(cpkdata.usl),
//     y1: height - margin.bottom,
//     x2: scaleX(cpkdata.usl),
//     y2: margin.top,
//   };

//   const lslLine = {
//     x1: scaleX(cpkdata.lsl),
//     y1: height - margin.bottom,
//     x2: scaleX(cpkdata.lsl),
//     y2: margin.top,
//   };

//   const uslText = { x: scaleX(cpkdata.usl), y: margin.top };
//   const lslText = { x: scaleX(cpkdata.lsl), y: margin.top };

//   this.setState({
//     bars,
//     scaleX,
//     scaleY,
//     paths,
//     uslLine,
//     lslLine,
//     uslText,
//     lslText,
//   });
// };
