import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Checklist } from '../model/checklist.model';
import { DataService } from '../service/data.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checklist-student',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  providers: [DataService],
  templateUrl: './checklist-student.component.html',
  styleUrls: ['./checklist-student.component.scss']
})
export class ChecklistStudentComponent implements OnInit {
  checklists: Checklist[] = [];
  filteredChecklists: Checklist[] = [];
  subjects: any[] = [];
  selectedSubjectId: any = '';
  currentTime: Date = new Date();
  user_id: any;
  searchTitle: string = '';
  searchDate: string = '';
  subjectTimes: { [key: string]: { time_start: string, time_end: string } } = {};
  pastAttendancesUpdated: boolean = false; // Flag to track if past attendances have been updated

  constructor(private dataService: DataService, private http: HttpClient, private route: Router) { }

  ngOnInit() {
    this.getUserData();
    this.getCurrentTime();
  }

  getUserData() {
    this.dataService.getUserData().subscribe(userData => {
      if (userData) {
        this.user_id = userData.std_id;
        this.getSubjects(this.user_id);
      } else {
        console.error('ไม่พบข้อมูลผู้ใช้');
      }
    });
  }

  getSubjects(std_id: any) {
    this.http.get<any[]>(`${this.dataService.apiUrl}/subject-student-list/${std_id}`).subscribe(
      (data) => {
        this.subjects = data;
        if (this.subjects.length === 0) {
          this.checklists = [];
          alert('คุณยังไม่ได้ลงทะเบียนวิชาใดๆ');
        } else {
          this.loadChecklist();
        }
      },
      (error) => {
        console.error('เกิดข้อผิดพลาดในการดึงรายวิชา:', error);
      }
    );
  }

  loadChecklist() {
    if (!this.selectedSubjectId) {
      this.checklists = [];
      this.filteredChecklists = [];
      return;
    }

    this.http.get<any>(`${this.dataService.apiUrl}/subject-time/${this.selectedSubjectId}`).subscribe(
      (times) => {
        this.subjectTimes[this.selectedSubjectId] = times;
        const url = `${this.dataService.apiUrl}/checklist-data/student/${this.user_id}/subject/${this.selectedSubjectId}`;

        this.http.get<Checklist[]>(url).subscribe(
          (data) => {
            const currentDate = this.getCurrentDate();
            this.checklists = data.filter(checklist => checklist.date === currentDate);
            this.applySearch();
          },
          (error) => {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเช็คชื่อ:', error);
            if (error.status === 404) {
              this.checklists = [];
              this.filteredChecklists = [];
            }
          }
        );

        if (!this.pastAttendancesUpdated) {
          this.updatePastAttendances(); // Update past attendances only if not done already
        }
      },
      (error) => {
        console.error('เกิดข้อผิดพลาดในการดึงเวลา:', error);
      }
    );
  }

  onSubjectChange(event: any) {
    this.selectedSubjectId = event.target.value;
    this.loadChecklist();
  }

  searchChecklist() {
    this.applySearch();
  }

  getSubjectName(subject_id: any): string {
    const subject = this.subjects.find(s => s.subject_id === subject_id);
    return subject ? subject.subject_name : '';
  }

  formatDateThai(date: string): string {
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const [year, month, day] = date.split('-').map(Number);
    const thaiYear = year + 543;
    const thaiMonth = months[month - 1];
    return `${day} ${thaiMonth} ${thaiYear}`;
  }

  getCurrentDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getCurrentTime() {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  applySearch() {
    this.filteredChecklists = this.checklists.filter(checklist => {
        const matchesTitle = checklist.title.toLowerCase().includes(this.searchTitle.toLowerCase());
        const matchesDate = this.searchDate ? checklist.date === this.searchDate : true;
        return matchesTitle && matchesDate;
    });
  }

  resetSearch() {
    this.searchTitle = '';
    this.searchDate = '';
    this.applySearch();
  }

  checkAttendance(checklist: Checklist) {
    const currentDate = new Date();
    const checklistDate = new Date(checklist.date);
    const subjectTimes = this.subjectTimes[this.selectedSubjectId] || {};
  
    console.log('Current Date:', currentDate);
    console.log('Checklist Date:', checklistDate);
    console.log('Subject Times:', subjectTimes);
  
    if (currentDate.toDateString() !== checklistDate.toDateString()) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่สามารถเช็คชื่อได้',
        text: 'วันนี้ไม่ตรงกับวันที่เช็คชื่อ'
      });
      return;
    }
  
    const currentTimeStr = this.currentTime.toLocaleTimeString('th-TH', { hour12: false });
    const timeStart = subjectTimes.time_start;
    const timeEnd = subjectTimes.time_end;
  
    console.log('Current Time:', currentTimeStr);
    console.log('Time Start:', timeStart);
    console.log('Time End:', timeEnd);
  
    if (currentTimeStr < timeStart) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่สามารถเช็คชื่อได้',
        text: 'ยังไม่ถึงเวลาเช็คชื่อ'
      });
      return;
    }
  
    if (currentTimeStr > timeEnd) {
      Swal.fire({
        icon: 'error',
        title: 'หมดเวลาเช็คชื่อ',
        text: 'คุณจะถูกบันทึกเป็นขาดเรียน'
      }).then(() => {
        this.recordAttendance(checklist.checklist_id, 'ขาดเรียน');
      });
      return;
    }
  
    this.route.navigate(['/checklist-attendance', checklist.checklist_id]);
  }
  
  recordAttendance(checklistId: number, status: string) {
    this.http.post(`${this.dataService.apiUrl}/update-attendance`, {
      checklist_id: checklistId,
      std_id: this.user_id,
      status: status
    }).subscribe(
      () => {
        Swal.fire('บันทึกสำเร็จ', '', 'success');
        this.loadChecklist();
      },
      (error) => {
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูลเช็คชื่อ:', error);
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลเช็คชื่อได้', 'error');
      }
    );
  }

  updatePastAttendances() {
    if (this.pastAttendancesUpdated) {
      return; // Skip update if it has already been done
    }

    this.http.post(`${this.dataService.apiUrl}/update-past-attendance`, {
      std_id: this.user_id,
      subject_id: this.selectedSubjectId
    }).subscribe(
      () => {
        this.pastAttendancesUpdated = true; // Set flag to true after successful update
        console.log('Past attendances updated successfully');
      },
      (error) => {
        console.error('Error updating past attendances:', error);
      }
    );
  }
}
