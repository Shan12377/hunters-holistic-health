export interface ProtocolItem {
  id: string
  text: string
  subtext?: string
  link?: string
  linkLabel?: string
  dose?: string
  timing?: string
  checked: boolean
  shared: boolean
  educatorNote?: string
  clientNote?: string
}

export interface ProtocolSection {
  id: string
  title: string
  description?: string
  phase?: 0 | 1 | 2 | 3
  items: ProtocolItem[]
  educatorNote?: string
  shared: boolean
}

export interface ProtocolPillar {
  id: string
  letter: string
  title: string
  subtitle: string
  sections: ProtocolSection[]
}

export interface ProtocolData {
  type: string
  pillars: ProtocolPillar[]
}
