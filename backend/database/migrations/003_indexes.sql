-- ===================================================================
-- Migration 003: Performance & SLA Analytics Indexes
-- ===================================================================

-- Index for SLA breach monitoring and active queue filtering
CREATE INDEX IF NOT EXISTS idx_tickets_status_sla ON tickets (status, sla_deadline);

-- Index for 30-day chronic recurrence engine lookup by asset and location
CREATE INDEX IF NOT EXISTS idx_tickets_asset_recurrence ON tickets (asset_tag, created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_location_recurrence ON tickets (location_id, category, created_at);

-- Index for automated technician workload and availability dispatch
CREATE INDEX IF NOT EXISTS idx_tech_dispatch ON technicians (department_id, is_available, active_tickets);

-- Index for chronic equipment query
CREATE INDEX IF NOT EXISTS idx_assets_chronic_lookup ON assets (failures_30d, status);
