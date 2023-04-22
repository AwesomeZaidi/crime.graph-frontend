import React, { useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Snackbar,
  Skeleton,
} from "@mui/material";
import { Alert } from "@mui/lab";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Text,
  TooltipProps,
} from "recharts";
import axios from "axios";

// Import Roboto font
import "@fontsource/roboto";

const logo = `${process.env.PUBLIC_URL}/logo.png`;

interface CustomTickProps {
  x: number;
  y: number;
  payload: any;
  fill: string;
}

// @ts-ignore
interface CustomTooltipProps extends TooltipProps {
  active?: boolean;
  payload?: any;
  label?: string;
}

const CustomTick: React.FC<CustomTickProps> = ({ x, y, payload, fill }) => {
  return (
    <Text x={x} y={y} fill={fill}>
      {payload.value}
    </Text>
  );
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || !payload.length) return null;

  const currentYearData = payload[0].payload;
  const { year, crimes, percentageChange } = currentYearData;

  return (
    <div
      style={{
        backgroundColor: "#292929",
        borderRadius: "5px",
        padding: "10px",
        fontFamily: "Roboto",
      }}
    >
      <p style={{ color: "white", fontFamily: "Roboto" }}>
        <strong>{year}</strong>
      </p>

      <p style={{ color: "white", fontFamily: "Roboto" }}>
        {crimes.toLocaleString()} crimes
      </p>

      {percentageChange !== undefined && (
        <p style={{ color: percentageChange >= 0 ? "#F44336" : "#4CAF50" }}>
          {percentageChange >= 0 ? "+" : "-"} {Math.abs(percentageChange)}%
        </p>
      )}
    </div>
  );
};

const App = () => {
  const [crimeType, setCrimeType] = useState("Homicide");
  const [yearsToDisplay, setYearsToDisplay] = useState(12);
  const [locationArea, setLocationArea] = useState("all");
  const [crimeData, setCrimeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    fetchCrimeData();
  }, []);

  const handleChange = (setter: React.Dispatch<React.SetStateAction<any>>) => {
    return (event: React.ChangeEvent<{ value: unknown }>) => {
      setter(event.target.value);
      setChanged(true);
    };
  };
  const fetchCrimeData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://crime-graph-backend.vercel.app/crime-trend",
        {
          params: {
            crimeType,
            yearsToDisplay: yearsToDisplay + 1,
            locationArea,
          },
        }
      );
      const sortedData = response.data.sort(
        (a: any, b: any) => a.year - b.year
      );

      const dataWithPercentageChange = sortedData.map(
        (item: any, index: number) => {
          if (index === 0) {
            return { ...item };
          } else {
            const prevYearCrimes = sortedData[index - 1].crimes;
            const percentageChange =
              ((item.crimes - prevYearCrimes) / prevYearCrimes) * 100;
            return {
              ...item,
              percentageChange: parseFloat(percentageChange.toFixed(2)),
            };
          }
        }
      );
      setCrimeData(dataWithPercentageChange);
    } catch (err) {
      setError("An error occurred while fetching crime data.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    fetchCrimeData();
    setChanged(false);
  };

  const getDynamicLocationText = () => {
    if (locationArea === "north") return "on the north side";
    if (locationArea === "south") return "on the south side";
    if (locationArea === "west") return "on the west side";
    if (locationArea === "loop") return "in the Loop";
    if (locationArea === "all") return "in all of Chicago";
    return `in the zipcode ${locationArea}`;
  };

  const handleCloseError = () => {
    setError("");
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Container
        maxWidth="lg"
        sx={{
          backgroundColor: "#292929",
          height: "90vh",
          paddingTop: "1em",
          margin: "0 auto",
        }}
      >
        <img
          src={logo}
          alt="Your Logo"
          width={300}
          style={{ margin: "0 auto" }}
        />
        <Box className="outter-container">
          <Box className="container">
            <Box className="filter-container">
              <Typography
                variant="h6"
                component="h3"
                sx={{ fontFamily: "SemiBold", color: "white" }}
                mb={2}
              >
                Filters
              </Typography>
              {/* Crime Type */}
              <FormControl
                fullWidth
                variant="outlined"
                size="small"
                sx={{ marginBottom: 2 }}
              >
                <InputLabel id="crimeType-label">Crime Type</InputLabel>
                <Select
                  labelId="crimeType-label"
                  value={crimeType}
                  // @ts-ignore
                  onChange={handleChange(setCrimeType)}
                  label="Crime Type"
                >
                  <MenuItem value="Homicide">Homicide</MenuItem>
                  <MenuItem value="Assault">Assault</MenuItem>
                  <MenuItem value="Robbery">Robbery</MenuItem>
                  <MenuItem value="Battery">Battery</MenuItem>
                  <MenuItem value="Arson">Arson</MenuItem>
                  <MenuItem value="Theft">Theft</MenuItem>
                </Select>
              </FormControl>
              {/* Years to Display */}
              <FormControl
                fullWidth
                variant="outlined"
                size="small"
                sx={{ marginBottom: 2 }}
              >
                <InputLabel id="years-label">Years</InputLabel>
                <Select
                  labelId="years-label"
                  value={yearsToDisplay}
                  // @ts-ignore
                  onChange={handleChange(setYearsToDisplay)}
                  label="Years"
                >
                  {/* Add your years options here */}
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={8}>8</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={12}>12</MenuItem>
                  <MenuItem value={16}>16</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                </Select>
              </FormControl>
              {/* Location Area */}
              <FormControl
                fullWidth
                variant="outlined"
                size="small"
                sx={{ marginBottom: 2 }}
              >
                <InputLabel id="location-label">Location</InputLabel>
                <Select
                  labelId="location-label"
                  value={locationArea}
                  // @ts-ignore
                  onChange={handleChange(setLocationArea)}
                  label="Location"
                >
                  {/* Add your location options here */}
                  <MenuItem value="north">North</MenuItem>
                  <MenuItem value="south">South</MenuItem>
                  <MenuItem value="west">West</MenuItem>
                  <MenuItem value="loop">Loop</MenuItem>
                  <MenuItem value="all">All</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleApply}
                disabled={!changed}
              >
                Apply Filter
              </Button>
            </Box>
            <Box className="graph-container">
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "Regular",
                    fontWeight: "normal",
                    textAlign: "center",
                    color: "white",
                    marginBottom: "2em",
                    width: "100%",
                  }}
                >
                  How many '
                  <span style={{ fontFamily: "ExtraBold" }}>{crimeType}</span>'
                  crimes happened in the past{" "}
                  <span style={{ fontFamily: "ExtraBold" }}>
                    {yearsToDisplay}
                  </span>{" "}
                  years{" "}
                  <span style={{ fontFamily: "ExtraBold" }}>
                    {getDynamicLocationText()}
                  </span>
                  ?
                </Typography>
                {loading ? (
                  <Skeleton variant="rectangular" width="auto" height={500} />
                ) : (
                  <ResponsiveContainer width="100%" height={500}>
                    <BarChart data={crimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" stroke="white" />
                      <YAxis stroke="white" />
                      <Tooltip content={<CustomTooltip />} />
                      {/* <Legend /> */}
                      <Bar dataKey="crimes" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
        {error && (
          <Snackbar
            open={error !== ""}
            autoHideDuration={6000}
            onClose={handleCloseError}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={handleCloseError}
              severity="error"
              sx={{ width: "100%" }}
            >
              {error}
            </Alert>
          </Snackbar>
        )}
      </Container>
    </ThemeProvider>
  );
};

const customTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#292929",
    },
    primary: {
      main: "#ffffff",
    },
  },
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "rgba(255, 255, 255, 0.87)",
          "&.Mui-focused": {
            color: "rgba(255, 255, 255, 0.87)",
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.25)",
          },
          "&.Mui-focused": {
            backgroundColor: "rgba(255, 255, 255, 0.15)",
          },
        },
        input: {
          color: "#ffffff",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255, 255, 255, 0.5)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff",
          },
        },
        input: {
          color: "#ffffff",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "#ffffff",
        },
      },
    },
  },
});

export default App;
