import { Time } from "@angular/common";

export interface Subject {
    subject_id: number;
    id_subject: string;
    subject_name: string;
    subject_engname: string;
    time_start: Time;
    time_end: Time;
    teacher_id: string;
    title: string;
    fname: string;
    lname: string;
}

