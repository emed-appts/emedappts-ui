import Vue from "vue";
import {
  GO_STEP,
  GO_NEXT_STEP,
  GO_PREV_STEP,
  SET_CALENDAR,
  RECEIVE_CALENDARS,
  SET_SLOTS,
  REMOVE_SLOT,
  ADD_PATIENT,
  REMOVE_PATIENT,
  ENABLE_EDITMODE,
  DISABLE_EDITMODE,
  RESET,
  ADD_WARNING,
  ADD_ERROR,
  REMOVE_ALERT,
  ENABLE_MAINTENANCEMODE
} from "./mutation-types";
import utils from "./utils";

export default {
  [RESET](state) {
    state.processID = utils.generateID();
    state.maintenanceMode = false;
    state.steps = [1];
    state.editMode = false;
    state.calendarInProcess = null;
    for (let id in state.slots) {
      Vue.delete(state.slots, id);
    }
    for (let insuranceNumber in state.patients) {
      Vue.delete(state.patients, insuranceNumber);
    }
    for (let uuid in state.alerts) {
      Vue.delete(state.alerts, uuid);
    }
  },
  [ENABLE_MAINTENANCEMODE](state) {
    state.maintenanceMode = true;
  },
  [GO_STEP](state, step) {
    state.steps.push(step);
  },
  [GO_NEXT_STEP](state) {
    const currentStep = state.steps[state.steps.length - 1];
    state.steps.push(currentStep + 1);
  },
  [GO_PREV_STEP](state) {
    state.steps.pop();
  },
  [SET_CALENDAR](state, calendar) {
    state.calendarInProcess = calendar;
  },
  [RECEIVE_CALENDARS](state, calendars) {
    for (let calendar of calendars) {
      if (!state.calendars[calendar.id]) {
        Vue.set(state.calendars, calendar.id, calendar);
      }
    }
  },
  [SET_SLOTS](state, slots) {
    Vue.set(state, "slots", {});
    for (let slot of slots) {
      Vue.set(state.slots, slot.time.getTime(), slot);
    }
  },
  [REMOVE_SLOT](state, slot) {
    Vue.delete(state.slots, slot.time.getTime());

    let patient = undefined;
    for (let patIndex in state.patients) {
      if (state.patients[patIndex].slots[0].equals(slot)) {
        patient = state.patients[patIndex];
        break;
      }
    }

    if (patient) {
      removePatient(state, patient);
    }
  },
  [ADD_PATIENT](state, patient) {
    if (!state.patients[patient.insuranceNumber]) {
      Vue.set(state.patients, patient.insuranceNumber, patient);
    }
  },
  [REMOVE_PATIENT](state, patient) {
    removePatient(state, patient);
  },
  [ENABLE_EDITMODE](state) {
    state.editMode = true;
  },
  [DISABLE_EDITMODE](state) {
    state.editMode = false;
  },
  [ADD_WARNING](state, { message }) {
    addAlert(state, { type: "warning", message });
  },
  [ADD_ERROR](state, { message }) {
    addAlert(state, { type: "error", message });
  },
  [REMOVE_ALERT](state, { uuid }) {
    Vue.delete(state.alerts, uuid);
  }
};

const addAlert = (state, alert) => {
  const uuid = utils.generateID();
  alert.uuid = uuid;
  Vue.set(state.alerts, uuid, alert);
};

const removePatient = (state, patient) => {
  Vue.delete(state.patients, patient.insuranceNumber);
};
