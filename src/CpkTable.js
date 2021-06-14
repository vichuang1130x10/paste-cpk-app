import React from "react";
import { Table } from "react-bootstrap";

export default function CpkTable({ data }) {
  return data ? (
    <Table
      striped
      bordered
      hover
      size="sm"
      style={{ width: "100%", fontSize: "12px", margin: "0 auto" }}
    >
      <thead>
        <tr>
          <th>CompType</th>
          <th>Sample Count</th>
          <th>Max</th>
          <th>Min</th>
          <th>Mean</th>
          <th>Stdev</th>
          <th>Cpk</th>
          <th>USL</th>
          <th>LSL</th>
        </tr>
      </thead>
      <tbody>
        {data.max ? (
          <tr>
            <td>{data.compType}</td>
            <td>{data.sampleCount}</td>
            <td>{data.max.toFixed(2)}</td>
            <td>{data.min.toFixed(2)}</td>
            <td>{data.mean.toFixed(2)}</td>
            <td>{data.stdev.toFixed(2)}</td>
            <td>{data.cpk.toFixed(2)}</td>
            <td>{data.usl.toFixed(2)}</td>
            <td>{data.lsl.toFixed(2)}</td>
          </tr>
        ) : null}
      </tbody>
    </Table>
  ) : null;
}
