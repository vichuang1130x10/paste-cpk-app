import React, { Component } from "react";
import * as d3 from "d3";
import { jStat } from "jstat";
import CpkTable from "./CpkTable";

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
  state = {};

  xAxis = React.createRef();
  // yAxis = React.createRef();
  static getDerivedStateFromProps(nextProps) {
    /* <Result data={whatever data is}/>*/
    const { data, options } = nextProps;
    if (!data) return {};

    const value = data.map((i) => parseFloat(i[options]) || 0.0);
    const compType = data.length ? data[0].CompType : "NA";
    const sampleCount = value.length;
    const cpkdata = calculateData(value);
    const tableData = { ...cpkdata, compType, sampleCount };
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

    return {
      bars,
      scaleX,
      scaleY,
      paths,
      uslLine,
      lslLine,
      uslText,
      lslText,
      tableData,
      options,
    };
  }

  componentDidMount() {
    this.createAxis();
  }
  componentDidUpdate() {
    this.createAxis();
  }

  createAxis = () => {
    const { scaleX } = this.state;
    let xAxisD3 = d3.axisBottom();

    xAxisD3.scale(scaleX);

    if (this.xAxis.current) {
      d3.select(this.xAxis.current).call(xAxisD3);
    }
  };

  render() {
    const {
      bars,
      paths,
      uslLine,
      lslLine,
      uslText,
      lslText,
      tableData,
      options,
    } = this.state;
    return bars.length ? (
      <div className="search">
        <h1>{options}</h1>
        <svg width={width} height={height} className="svg-container">
          {bars.map((d, i) => (
            <rect
              key={i}
              x={d.x}
              y={d.y}
              width={d.width}
              height={d.height}
              fill={d.fill}
              strokeWidth={"1px"}
              stroke={"#000"}
            />
          ))}

          <path
            d={paths}
            fill={"none"}
            stroke={"#920e0e"}
            strokeWidth={"1.5px"}
            // strokeDasharray={"8"}
            // shapeRendering={"crispEdges"}
          />
          {uslLine ? (
            <line
              x1={uslLine.x1}
              y1={uslLine.y1}
              x2={uslLine.x2}
              y2={uslLine.y2}
              stroke={"#881212"}
              strokeWidth={"1.5px"}
              strokeDasharray={"8"}
              shapeRendering={"crispEdges"}
            />
          ) : null}
          {lslLine ? (
            <line
              x1={lslLine.x1}
              y1={lslLine.y1}
              x2={lslLine.x2}
              y2={lslLine.y2}
              stroke={"#881212"}
              strokeWidth={"1.5px"}
              strokeDasharray={"8"}
              shapeRendering={"crispEdges"}
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
        </svg>
        <CpkTable data={tableData} />
      </div>
    ) : null;
  }
}

export default App;
