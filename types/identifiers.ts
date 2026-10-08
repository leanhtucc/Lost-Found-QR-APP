/** Opaque string aliases documenting backend identifier semantics. */
export type ItemInternalId = string;
export type ItemId = string;
export type QRCodeId = string;
export type FoundReportId = string;
export type ReportId = string;
export type ChannelId = string;
export type ReturnSessionId = string;

/** `found:<FoundReportId>` feed keys are not Item identifiers. */
export type DiscoveryItemKey = string;
