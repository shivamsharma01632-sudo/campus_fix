/**
 * CampusFix Technician Assignment Engine
 * Deterministically routes tickets to the least loaded, available specialist in the department
 */

const TechnicianModel = require('../models/technician.model');
const DepartmentModel = require('../models/department.model');
const logger = require('../utils/logger');

const AssignmentService = {
  /**
   * Automatically select best suited technician for the issue
   */
  async autoAssign(departmentName, category = '') {
    // 1. Resolve department
    let dept = await DepartmentModel.findByName(departmentName);
    if (!dept) {
      // Default to Facilities
      dept = await DepartmentModel.findByName('Campus Facilities');
    }

    const deptId = dept ? dept.id : 1;

    // 2. Fetch technicians for this department
    const technicians = await TechnicianModel.findByDepartmentId(deptId);

    if (!technicians || technicians.length === 0) {
      // Fallback: fetch all active technicians
      const allTechs = await TechnicianModel.findAll();
      if (!allTechs || allTechs.length === 0) {
        return { technicianId: null, technicianName: 'Unassigned', departmentId: deptId, departmentName: dept ? dept.name : departmentName };
      }
      // Sort by workload
      allTechs.sort((a, b) => (a.active_tickets || 0) - (b.active_tickets || 0));
      const chosen = allTechs[0];
      return {
        technicianId: chosen.id,
        technicianName: chosen.name,
        departmentId: chosen.department_id || deptId,
        departmentName: chosen.department_name || departmentName
      };
    }

    // 3. Score matching: prefer specialty keyword match, then lowest active workload
    const catLower = String(category).toLowerCase();
    const scored = technicians.map(t => {
      let score = 0;
      const specLower = (t.specialty || '').toLowerCase();
      if (catLower && specLower.includes(catLower)) score += 5;
      // Workload penalty
      score -= (t.active_tickets || 0) * 2;
      return { tech: t, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const selected = scored[0].tech;

    logger.info(`Auto-assigned ticket to technician: ${selected.name} (${selected.specialty})`);

    return {
      technicianId: selected.id,
      technicianName: selected.name,
      departmentId: dept.id,
      departmentName: dept.name
    };
  },

  /**
   * Manual admin assignment/reassignment
   */
  async manualAssign(ticketId, technicianNameOrId, adminUser) {
    let tech = null;
    if (isNaN(technicianNameOrId)) {
      tech = await TechnicianModel.findByName(technicianNameOrId);
    } else {
      tech = await TechnicianModel.findById(technicianNameOrId);
    }

    if (!tech) {
      throw new Error(`Technician '${technicianNameOrId}' not found in registry.`);
    }

    return {
      technicianId: tech.id,
      technicianName: tech.name,
      departmentId: tech.department_id,
      departmentName: tech.department_name
    };
  }
};

module.exports = AssignmentService;
