
export interface HousingUnit {
  id: string;
  type: string;
  district: string;
  building: string;
  floor: string;
  roomNumber: string;
  area: string;
  constructionArea: string;
}

export interface ParticipantNeed {
  housingType: string;
  quantity: number;
}

export interface Participant {
  id: string;
  name: string;
  sequence?: number;
  needs: ParticipantNeed[];
}

export interface AllocationResult {
  participantName: string;
  sequence: number;
  allocatedUnits: HousingUnit[];
}
