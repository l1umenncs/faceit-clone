export const getLevel = (elo) => {
  if (elo < 501)  return { level: 1,  color: "#d3d3d3" }
  if (elo < 751)  return { level: 2,  color: "#d3d3d3" }
  if (elo < 901)  return { level: 3,  color: "#00cc44" }
  if (elo < 1051) return { level: 4,  color: "#00cc44" }
  if (elo < 1201) return { level: 5,  color: "#f5a623" }
  if (elo < 1351) return { level: 6,  color: "#f5a623" }
  if (elo < 1531) return { level: 7,  color: "#f5a623" }
  if (elo < 1751) return { level: 8,  color: "#ff5500" }
  if (elo < 2001) return { level: 9,  color: "#ff5500" }
  return           { level: 10, color: "#cc0000" }
}