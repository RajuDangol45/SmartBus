export interface BusDetails {
  id: string;
  busData: {
    current_station: string;
    temperature: number;
    speed: number;
    humidity: number;
    crash_status: string;
    eta: number;
  };
}
