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
    testConnect(db) {
        return db('patient').select('hn').limit(1);
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
            .select('opdscreen.hn', 'opdscreen.vn as visitno', 'opdscreen.vstdate as date', 'opdscreen.vsttime as time', 'opdscreen.bps as bp_systolic', 'opdscreen.bpd as bp_diastolic', 'opdscreen.pulse as pr', 'opdscreen.rr', 'ovst.vstdate as hdate', 'ovst.vsttime as htime', 'er_nursing_detail.gcs_e as eye', 'er_nursing_detail.gcs_v as verbal', 'er_nursing_detail.gcs_m as motor', 'er_nursing_detail.er_accident_type_id as cause', 'er_nursing_detail.accident_place_type_id as apoint', 'er_nursing_detail.accident_transport_type_id as injt', 'er_nursing_detail.accident_person_type_id as injp', 'er_nursing_detail.accident_airway_type_id as airway', 'er_nursing_detail.accident_alcohol_type_id as risk1', 'er_nursing_detail.accident_drug_type_id as risk2', 'er_nursing_detail.accident_belt_type_id as risk3', 'er_nursing_detail.accident_helmet_type_id as risk4', 'er_nursing_detail.accident_bleed_type_id as blood', 'er_nursing_detail.accident_splint_type_id as splintc', 'er_nursing_detail.accident_fluid_type_id as iv', 'er_nursing_detail.accident_type_1 as br1', 'er_nursing_detail.accident_type_2 as br2', 'er_nursing_detail.accident_type_3 as tinj', 'er_nursing_detail.accident_type_4 as ais1', 'er_nursing_detail.accident_type_5 as ais2', 'er_regist.finish_time as disc_date_er', 'er_regist.er_emergency_type as cause_t', 'ipt.ward as wardcode', 'referin.refer_hospcode as htohosp')
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
