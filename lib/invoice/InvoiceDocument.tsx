import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { BookingWithRelations } from "./ensureInvoiceNumber";

// ─── Styles ────────────────────────────────────────────────────────────────

const C = {
  brand: "#2563EB",      // blue-600
  brandLight: "#EFF6FF", // blue-50
  dark: "#111827",       // gray-900
  mid: "#374151",        // gray-700
  muted: "#6B7280",      // gray-500
  border: "#E5E7EB",     // gray-200
  green: "#059669",      // emerald-600
  greenBg: "#ECFDF5",    // emerald-50
  amber: "#D97706",      // amber-600
  amberBg: "#FFFBEB",    // amber-50
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: C.white,
    paddingTop: 48,
    paddingBottom: 60,
    paddingHorizontal: 48,
    fontSize: 10,
    color: C.mid,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: C.brand,
  },
  logoBlock: { flexDirection: "column", gap: 2 },
  logoIcon: {
    width: 36,
    height: 36,
    backgroundColor: C.brand,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  logoIconText: { color: C.white, fontSize: 18, fontFamily: "Helvetica-Bold" },
  platformName: { fontSize: 18, fontFamily: "Helvetica-Bold", color: C.dark },
  platformTagline: { fontSize: 9, color: C.muted, marginTop: 2 },
  invoiceTitleBlock: { alignItems: "flex-end" },
  invoiceTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: C.brand,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  invoiceSubtitle: { fontSize: 9, color: C.muted, marginTop: 4 },

  // ── Status badge ────────────────────────────────────────────────────────
  statusRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: { fontSize: 9, fontFamily: "Helvetica-Bold" },

  // ── Meta row ────────────────────────────────────────────────────────────
  metaGrid: {
    flexDirection: "row",
    gap: 0,
    marginBottom: 28,
  },
  metaCard: {
    flex: 1,
    backgroundColor: C.brandLight,
    padding: 14,
    borderRadius: 8,
    marginRight: 10,
  },
  metaCardLast: {
    flex: 1,
    backgroundColor: C.brandLight,
    padding: 14,
    borderRadius: 8,
  },
  metaLabel: { fontSize: 8, color: C.brand, fontFamily: "Helvetica-Bold", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 },
  metaValue: { fontSize: 10, color: C.dark, fontFamily: "Helvetica-Bold" },
  metaValueSmall: { fontSize: 9, color: C.mid },

  // ── Two-column parties section ───────────────────────────────────────────
  partiesRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  partyCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 14,
  },
  partySectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.brand,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  partyName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 3 },
  partyDetail: { fontSize: 9, color: C.muted, marginBottom: 2 },

  // ── Booking details table ────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.brand,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.dark,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  tableHeaderText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  colWide: { flex: 3 },
  colMid: { flex: 2 },
  colNarrow: { flex: 1, alignItems: "flex-end" },
  cellText: { fontSize: 9, color: C.mid },
  cellTextBold: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.dark },

  // ── Pricing ─────────────────────────────────────────────────────────────
  pricingSection: { marginTop: 20, marginBottom: 28 },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 5,
    paddingHorizontal: 12,
    gap: 40,
  },
  pricingLabel: { fontSize: 9, color: C.muted, width: 120, textAlign: "right" },
  pricingValue: { fontSize: 9, color: C.mid, width: 80, textAlign: "right" },
  pricingDivider: {
    borderTopWidth: 2,
    borderTopColor: C.dark,
    marginHorizontal: 12,
    marginVertical: 6,
  },
  pricingTotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 40,
    backgroundColor: C.dark,
    borderRadius: 8,
    marginHorizontal: 0,
  },
  pricingTotalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    width: 120,
    textAlign: "right",
  },
  pricingTotalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    width: 80,
    textAlign: "right",
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  footerNote: { fontSize: 8, color: C.muted, maxWidth: "55%" },
  footerBrand: { fontSize: 8, color: C.muted, textAlign: "right" },
});

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(d: Date | string): string {
  return new Date(d).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function durationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

// ─── Component ─────────────────────────────────────────────────────────────

interface Props {
  booking: BookingWithRelations;
}

export function InvoiceDocument({ booking }: Props) {
  const start = new Date(booking.start);
  const end = new Date(booking.end);
  const durationMins =
    booking.resource.duration ||
    Math.round((end.getTime() - start.getTime()) / 60000);
  const unitPrice = booking.resource.price; // stored in cents
  const seats = booking.seats;
  const subtotal = unitPrice * seats;
  const total = subtotal; // taxes can be added here later

  return (
    <Document
      title={`Invoice ${booking.invoiceNumber}`}
      author="BookingEngine"
      subject="Booking Receipt"
    >
      <Page size="A4" style={styles.page}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.logoBlock}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoIconText}>B</Text>
            </View>
            <Text style={styles.platformName}>BookingEngine</Text>
            <Text style={styles.platformTagline}>Online Booking Platform</Text>
          </View>
          <View style={styles.invoiceTitleBlock}>
            <Text style={styles.invoiceTitle}>Booking Receipt</Text>
            <Text style={styles.invoiceSubtitle}>
              This is a system-generated booking confirmation
            </Text>
          </View>
        </View>

        {/* ── STATUS BADGES ── */}
        <View style={styles.statusRow}>
          <View style={[styles.badge, { backgroundColor: C.greenBg }]}>
            <Text style={[styles.badgeText, { color: C.green }]}>
              ✓  Booking: {booking.status}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: C.amberBg }]}>
            <Text style={[styles.badgeText, { color: C.amber }]}>
              ⏳  Payment: PENDING
            </Text>
          </View>
        </View>

        {/* ── META CARDS ── */}
        <View style={styles.metaGrid}>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Invoice Number</Text>
            <Text style={styles.metaValue}>{booking.invoiceNumber}</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Booking ID</Text>
            <Text style={styles.metaValueSmall}>{booking.id}</Text>
          </View>
          <View style={styles.metaCardLast}>
            <Text style={styles.metaLabel}>Issue Date</Text>
            <Text style={styles.metaValue}>
              {formatDate(booking.invoiceGeneratedAt ?? booking.createdAt)}
            </Text>
          </View>
        </View>

        {/* ── CUSTOMER + PROVIDER ── */}
        <View style={styles.partiesRow}>
          <View style={styles.partyCard}>
            <Text style={styles.partySectionTitle}>Customer</Text>
            <Text style={styles.partyName}>{booking.user.name ?? "—"}</Text>
            <Text style={styles.partyDetail}>{booking.user.email}</Text>
          </View>
          <View style={styles.partyCard}>
            <Text style={styles.partySectionTitle}>Service Provider</Text>
            <Text style={styles.partyName}>{booking.provider.name}</Text>
            <Text style={styles.partyDetail}>
              {booking.provider.category?.name ?? "—"}
            </Text>
          </View>
        </View>

        {/* ── BOOKING DETAILS TABLE ── */}
        <Text style={styles.sectionTitle}>Booking Details</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colWide]}>Service / Resource</Text>
          <Text style={[styles.tableHeaderText, styles.colMid]}>Date & Time</Text>
          <Text style={[styles.tableHeaderText, styles.colMid]}>Duration</Text>
          <Text style={[styles.tableHeaderText, styles.colNarrow]}>Seats</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.cellTextBold, styles.colWide]}>
            {booking.resource.name}
          </Text>
          <Text style={[styles.cellText, styles.colMid]}>
            {formatDateTime(start)}
          </Text>
          <Text style={[styles.cellText, styles.colMid]}>
            {durationLabel(durationMins)}
          </Text>
          <Text style={[styles.cellText, styles.colNarrow]}>{seats}</Text>
        </View>
        <View style={styles.tableRowAlt}>
          <Text style={[styles.cellText, styles.colWide]} />
          <Text style={[styles.cellText, styles.colMid]}>
            Until {formatDateTime(end)}
          </Text>
          <Text style={[styles.cellText, styles.colMid]} />
          <Text style={[styles.cellText, styles.colNarrow]} />
        </View>

        {/* ── PRICING ── */}
        <View style={styles.pricingSection}>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Unit Price</Text>
            <Text style={styles.pricingValue}>{formatCurrency(unitPrice)}</Text>
          </View>
          {seats > 1 && (
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>× {seats} Seats</Text>
              <Text style={styles.pricingValue}>{formatCurrency(subtotal)}</Text>
            </View>
          )}
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Taxes</Text>
            <Text style={styles.pricingValue}>—</Text>
          </View>
          <View style={styles.pricingDivider} />
          <View style={styles.pricingTotalRow}>
            <Text style={styles.pricingTotalLabel}>Total Amount</Text>
            <Text style={styles.pricingTotalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerNote}>
            This is a system-generated booking receipt. It is not a final financial
            invoice. Payment confirmation will follow upon successful payment.
          </Text>
          <Text style={styles.footerBrand}>
            BookingEngine · bookingengine.app{"\n"}
            support@bookingengine.app
          </Text>
        </View>
      </Page>
    </Document>
  );
}
