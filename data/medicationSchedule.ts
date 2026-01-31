import { Patient, ScheduledMedicine } from '../types';

export const MEDICATION_SCHEDULE: ScheduledMedicine[] = [
    // --- PAPÁ JORGE ---
    {
        id: 'j-08-00-novet',
        patient: Patient.JORGE,
        time: '08:00',
        name: 'Novet',
        dose: '1 dosis',
        frequency: { type: 'daily' }
    },
    {
        id: 'j-12-00-silodosina',
        patient: Patient.JORGE,
        time: '12:00',
        name: 'Silodosina',
        dose: '1 tab',
        frequency: { type: 'daily' }
    },
    {
        id: 'j-12-00-aeon',
        patient: Patient.JORGE,
        time: '12:00',
        name: 'Aeon Digestopan',
        dose: '1 tab',
        frequency: { type: 'daily' }
    },
    {
        id: 'j-12-00-corplus',
        patient: Patient.JORGE,
        time: '12:00',
        name: 'Corplus',
        dose: '1 tab',
        frequency: { type: 'daily' }
    },
    {
        id: 'j-12-00-anon',
        patient: Patient.JORGE,
        time: '12:00',
        name: 'Anon',
        dose: 'inhalación',
        frequency: { type: 'daily' }
    },
    {
        id: 'j-13-00-xigduo',
        patient: Patient.JORGE,
        time: '13:00',
        name: 'Xig Duo',
        dose: '1 tab',
        frequency: { type: 'daily' }
    },
    {
        id: 'j-13-00-osteoblaskol',
        patient: Patient.JORGE,
        time: '13:00',
        name: 'Osteoblaskol',
        dose: '1 tab',
        frequency: { type: 'daily' }
    },
    {
        id: 'j-13-00-daflon',
        patient: Patient.JORGE,
        time: '13:00',
        name: 'Daflón',
        dose: '1 dosis',
        frequency: { type: 'days', days: [1, 3, 5] } // L / M / V
    },
    {
        id: 'j-17-00-digestotal',
        patient: Patient.JORGE,
        time: '17:00',
        name: 'Digestotal',
        dose: '1 dosis',
        frequency: { type: 'daily' }
    },
    {
        id: 'j-19-00-hiprostan',
        patient: Patient.JORGE,
        time: '19:00',
        name: 'Hiprostan D',
        dose: '1 tab',
        frequency: { type: 'daily' }
    },
    {
        id: 'j-19-00-tapris',
        patient: Patient.JORGE,
        time: '19:00',
        name: 'Tapris 50 mg',
        dose: '½ tab',
        frequency: { type: 'daily' }
    },
    {
        id: 'j-20-00-xarelto',
        patient: Patient.JORGE,
        time: '20:00',
        name: 'Xarelto 10 mg',
        dose: '1 dosis',
        frequency: { type: 'daily' }
    },
    {
        id: 'j-20-00-lipanon',
        patient: Patient.JORGE,
        time: '20:00',
        name: 'Lipanon',
        dose: '½ tab',
        frequency: { type: 'days', days: [1, 3, 5] } // L / M / V
    },
    {
        id: 'j-20-00-dexlanzopral',
        patient: Patient.JORGE,
        time: '20:00',
        name: 'Dexlanzopral',
        dose: '1 tab',
        frequency: { type: 'daily' }
    },
    {
        id: 'j-20-00-apevitin',
        patient: Patient.JORGE,
        time: '20:00',
        name: 'APEVITIN BC',
        dose: 'jarabe',
        frequency: { type: 'daily' }
    },

    // --- MAMÁ TERESITA ---
    {
        id: 't-07-00-eutirox',
        patient: Patient.TERESA,
        time: '07:00',
        name: 'Eutirox 75 mg',
        dose: '1 dosis',
        frequency: { type: 'daily' }
    },
    {
        id: 't-08-00-tiriarita',
        patient: Patient.TERESA,
        time: '08:00',
        name: 'Tiriarita 10 mg',
        dose: '1 dosis',
        frequency: { type: 'daily' }
    },
    {
        id: 't-08-00-concor',
        patient: Patient.TERESA,
        time: '08:00',
        name: 'Concor 1,25 mg',
        dose: '1 dosis',
        frequency: { type: 'daily' }
    },
    {
        id: 't-08-00-omeprazol',
        patient: Patient.TERESA,
        time: '08:00',
        name: 'Omeprazol 20 mg',
        dose: '1 dosis',
        frequency: { type: 'daily' }
    },
    {
        id: 't-09-00-corplus',
        patient: Patient.TERESA,
        time: '09:00',
        name: 'Corplus',
        dose: '1 dosis',
        frequency: { type: 'daily' }
    },
    {
        id: 't-09-00-densibon',
        patient: Patient.TERESA,
        time: '09:00',
        name: 'Densibon D',
        dose: '1 dosis',
        frequency: { type: 'daily' }
    },
    {
        id: 't-10-00-alopurinol',
        patient: Patient.TERESA,
        time: '10:00',
        name: 'Alopurinol',
        dose: '½ tab',
        frequency: { type: 'days', days: [1, 3, 5] } // L / M / V
    },
    {
        id: 't-10-00-olanzapina-1',
        patient: Patient.TERESA,
        time: '10:00',
        name: 'Olanzapina',
        dose: '½ tab',
        frequency: { type: 'daily' }
    },
    {
        id: 't-12-00-espiolto',
        patient: Patient.TERESA,
        time: '12:00',
        name: 'Espiolto',
        dose: 'inhalación',
        frequency: { type: 'daily' }
    },
    {
        id: 't-12-00-apracal-1',
        patient: Patient.TERESA,
        time: '12:00',
        name: 'Apracal',
        dose: '3 gotas',
        frequency: { type: 'daily' }
    },
    {
        id: 't-13-00-daflon',
        patient: Patient.TERESA,
        time: '13:00',
        name: 'Daflón',
        dose: '1 dosis',
        frequency: { type: 'days', days: [1, 3, 5] } // L / M / V
    },
    {
        id: 't-17-00-olanzapina-2',
        patient: Patient.TERESA,
        time: '17:00',
        name: 'Olanzapina 7,5 mg',
        dose: '1 dosis',
        frequency: { type: 'daily' }
    },
    {
        id: 't-18-00-paxil',
        patient: Patient.TERESA,
        time: '18:00',
        name: 'Paxil 20 mg',
        dose: '1 dosis',
        frequency: { type: 'daily' }
    },
    {
        id: 't-20-00-concor',
        patient: Patient.TERESA,
        time: '20:00',
        name: 'Concor 1,25 mg',
        dose: '1 dosis',
        frequency: { type: 'daily' }
    },
    {
        id: 't-20-00-expansia',
        patient: Patient.TERESA,
        time: '20:00',
        name: 'Expansia 75 mg',
        dose: '1 dosis',
        frequency: { type: 'daily' }
    },
    {
        id: 't-20-00-lipator',
        patient: Patient.TERESA,
        time: '20:00',
        name: 'Lipator 10 mg',
        dose: '1 dosis',
        frequency: { type: 'daily' }
    },
    {
        id: 't-20-00-ribastick',
        patient: Patient.TERESA,
        time: '20:00',
        name: 'Ribastick',
        dose: 'parche',
        frequency: { type: 'daily' }
    },
    {
        id: 't-21-00-apracal-2',
        patient: Patient.TERESA,
        time: '21:00',
        name: 'Apracal',
        dose: '5 gotas',
        frequency: { type: 'daily' }
    },
    {
        id: 't-21-00-lactulosa',
        patient: Patient.TERESA,
        time: '21:00',
        name: 'Lactulosa',
        dose: '1 dosis',
        frequency: { type: 'daily' }
    },
];
