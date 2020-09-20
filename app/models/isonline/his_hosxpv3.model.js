"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HisHosxpv3Model = void 0;
const dbName = process.env.HIS_DB_NAME;
class HisHosxpv3Model {
    getTableName(knex) {
        return knex
            .select('TABLE_NAME')
            .from('information_schema.tables')
            .where('TABLE_SCHEMA', '=', dbName);
    }
    getPerson(db, columnName, searchText) {
        return db('patient')
            .leftJoin(`occupation`, 'occupation.occupation', 'patient.occupation')
            .select('patient.hn', 'patient.cid', 'patient.pname as prename', 'patient.fname', 'patient.lname', 'patient.occupation as occupa', 'patient.birthday as dob', 'patient.sex', 'patient.moopart as moo', 'patient.road', 'patient.addrpart as address', 'patient.hometel as tel', 'patient.po_code as zip', 'occupation.nhso_code as occupation')
            .select(db.raw('CONCAT(chwpart,amppart,tmbpart) as addcode'))
            .where(columnName, "=", searchText);
    }
    getOpdService(knex, hn, date) {
        return knex
            .select('opdscreen.hn', 'opdscreen.vn as visitno', 'opdscreen.vstdate as date', 'opdscreen.vsttime as time', 'opdscreen.bps as bp_systolic', 'opdscreen.bpd as bp_diastolic', 'opdscreen.pulse as pr', 'opdscreen.rr', 'ovst.vstdate as hdate', 'ovst.vsttime as htime', 'er_nursing_detail.gcs_e as eye', 'er_nursing_detail.gcs_v as verbal', 'er_nursing_detail.gcs_m as motor', 'er_accident_type.is_code as cause', 'accident_place_type.is_code as apoint', 'accident_transport_type.is_code as injt', 'accident_person_type.is_code as injp', 'accident_airway_type.is_code as airway', 'accident_alcohol_type.is_code as risk1', 'accident_drug_type.is_code as risk2', 'accident_belt_type.is_code as risk3', 'accident_helmet_type.is_code as risk4', 'accident_bleed_type.is_code as blood', 'accident_splint_type.is_code as splintc', 'accident_fluid_type.is_code as iv', 'er_nursing_detail.accident_type_1 as br1', 'er_nursing_detail.accident_type_2 as br2', 'er_nursing_detail.accident_type_3 as tinj', 'er_nursing_detail.accident_type_4 as ais1', 'er_nursing_detail.accident_type_5 as ais2', 'er_regist.finish_time as disc_date_er', 'er_regist.er_emergency_type as cause_t', 'ipt.ward as wardcode', 'referin.refer_hospcode as htohosp')
            .select(knex.raw('if(ovstdiag.diagtype =1,ovstdiag.icd10,null) as diag1'))
            .select(knex.raw('if(ovstdiag.diagtype =2,ovstdiag.icd10,null) as diag2'))
            .from('opdscreen')
            .leftJoin(`ovst`, 'ovst.vn', 'opdscreen.vn')
            .leftJoin(`patient`, 'patient.hn', 'opdscreen.hn')
            .leftJoin(`er_regist`, 'er_regist.vn', 'ovst.vn')
            .leftJoin(`er_nursing_detail`, 'er_nursing_detail.vn', 'opdscreen.vn')
            .leftJoin(`ovstdiag`, 'ovstdiag.vn', 'opdscreen.vn')
            .leftJoin(`ipt`, 'ipt.vn', 'opdscreen.vn')
            .leftJoin(`referin`, 'referin.vn', 'opdscreen.vn')
            .leftJoin(`accident_airway_type`, 'accident_airway_type.accident_airway_type_id', 'er_nursing_detail.accident_airway_type_id')
            .leftJoin(`er_accident_type`, 'er_accident_type.er_accident_type_id', 'er_nursing_detail.er_accident_type_id')
            .leftJoin(`accident_transport_type`, 'accident_transport_type.accident_transport_type_id', 'er_nursing_detail.accident_transport_type_id')
            .leftJoin(`accident_place_type`, 'accident_place_type.accident_place_type_id', 'er_nursing_detail.accident_place_type_id')
            .leftJoin(`accident_alcohol_type`, 'accident_alcohol_type.accident_alcohol_type_id', 'er_nursing_detail.accident_alcohol_type_id')
            .leftJoin(`accident_drug_type`, 'accident_drug_type.accident_drug_type_id', 'er_nursing_detail.accident_drug_type_id')
            .leftJoin(`accident_belt_type`, 'accident_belt_type.accident_belt_type_id', 'er_nursing_detail.accident_belt_type_id')
            .leftJoin(`accident_helmet_type`, 'accident_helmet_type.accident_helmet_type_id', 'er_nursing_detail.accident_helmet_type_id')
            .leftJoin(`accident_bleed_type`, 'accident_bleed_type.accident_bleed_type_id', 'er_nursing_detail.accident_bleed_type_id')
            .leftJoin(`accident_fluid_type`, 'accident_fluid_type.accident_fluid_type_id', 'er_nursing_detail.accident_fluid_type_id')
            .leftJoin(`accident_splint_type`, 'accident_splint_type.accident_splint_type_id', 'er_nursing_detail.accident_splint_type_id')
            .leftJoin(`accident_person_type`, 'accident_person_type.accident_person_type_id', 'er_nursing_detail.accident_person_type_id')
            .where('opdscreen.hn', "=", hn)
            .where('opdscreen.vstdate', "=", date);
    }
    getDiagnosisOpd(db, visitno) {
        return db('ovstdiag')
            .select('vn as visitno', 'icd10 as diagcode', 'diagtype as diag_type', 'hn', 'update_datetime as d_update')
            .select(db.raw(`concat(vstdate,' ',vsttime) as date_serv`))
            .where('vn', "=", visitno);
    }
    getProcedureOpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('procedure_opd')
            .where(columnName, "=", searchNo);
    }
    getChargeOpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('charge_opd')
            .where(columnName, "=", searchNo);
    }
    getDrugOpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('drug_opd')
            .where(columnName, "=", searchNo);
    }
    getAdmission(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('admission')
            .where(columnName, "=", searchNo);
    }
    getDiagnosisIpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('diagnosis_ipd')
            .where(columnName, "=", searchNo);
    }
    getProcedureIpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('procedure_ipd')
            .where(columnName, "=", searchNo);
    }
    getChargeIpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('charge_ipd')
            .where(columnName, "=", searchNo);
    }
    getDrugIpd(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('drug_ipd')
            .where(columnName, "=", searchNo);
    }
    getAccident(knex, visitno) {
        return knex
            .select()
            .where(visitno, "=", visitno);
    }
    getAppointment(knex, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from('appointment')
            .where(columnName, "=", searchNo);
    }
    getData(knex, tableName, columnName, searchNo, hospCode) {
        return knex
            .select('*')
            .from(tableName)
            .where(columnName, "=", searchNo)
            .limit(5000);
    }
}
exports.HisHosxpv3Model = HisHosxpv3Model;
