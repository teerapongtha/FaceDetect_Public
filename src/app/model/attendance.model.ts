import { Time } from "@angular/common";

export interface Attendance {
    attendance_id : number;
    time_attendance: Time;
    status: string;
    std_id : number;
    img_attendance: string;
    checklist_id : string;
}