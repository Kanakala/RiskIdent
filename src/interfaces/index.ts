interface ConnectionInfo {
  type: string;
  confidence: number;
}

interface CombinedConnectionInfo {
  types: string[];
  confidence: number;
}

interface GeoInfo {
  latitude: number;
  longitude: number;
}

export interface ITransaction {
  id: string;
  age: number;
  name: string;
  email: string;
  phone: string;
  children: ITransaction[];
  connectionInfo: ConnectionInfo;
  combinedConnectionInfo: CombinedConnectionInfo;
  geoInfo: GeoInfo;
}
