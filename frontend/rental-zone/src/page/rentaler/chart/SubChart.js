import React from "react";
import { Bar } from "react-chartjs-2";

const SubChart = ({ chartData }) => {
  return <Bar data={chartData} />;
};

export default SubChart;
