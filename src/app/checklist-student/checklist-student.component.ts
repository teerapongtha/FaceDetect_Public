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
  subjects: any[] = [];
  selectedSubjectId: any = '';
  currentTime: Date = new Date();
  user_id: any;

  constructor(private dataService: DataService, private http: HttpClient, private route: Router) { }

  ngOnInit() {
    this.getUserData();
    this.getCurrentTime();
  }

  // ดึงข้อมูล user_id และวิชาที่ลงทะเบียน
  getUserData() {
    this.dataService.getUserData().subscribe(userData => {
      if (userData) {
        this.user_id = userData.std_id;
        this.getSubjects(this.user_id); // ดึงข้อมูลวิชาที่ลงทะเบียน
      } else {
        console.error('ไม่พบข้อมูลผู้ใช้');
      }
    });
  }

  // ดึงข้อมูลวิชาที่นิสิตลงทะเบียน
  getSubjects(std_id: any) {
    this.http.get<any[]>(`${this.dataService.apiUrl}/subject-student-list/${std_id}`).subscribe(
      (data) => {
        this.subjects = data;
        if (this.subjects.length === 0) {
          this.checklists = []; // ไม่มีข้อมูลให้แสดง
          alert('คุณยังไม่ได้ลงทะเบียนวิชาใดๆ');
        } else {
          this.loadChecklist(); // โหลดรายการเช็คชื่อเริ่มต้นเมื่อดึงข้อมูลวิชาเสร็จ
        }
      },
      (error) => {
        console.error('เกิดข้อผิดพลาดในการดึงรายวิชา:', error);
      }
    );
  }

  // โหลดรายการเช็คชื่อสำหรับวิชาที่เลือก
  loadChecklist() {
    if (!this.selectedSubjectId) {
      this.checklists = []; // ถ้าไม่ได้เลือกวิชา ไม่โหลดข้อมูลใดๆ
      return;
    }
  
    const url = `${this.dataService.apiUrl}/checklist-data/student/${this.user_id}/subject/${this.selectedSubjectId}`;
  
    this.http.get<Checklist[]>(url).subscribe(
      (data) => {
        this.checklists = data;
      },
      (error) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเช็คชื่อ:', error);
        if (error.status === 404) {
          this.checklists = []; // ถ้าไม่มีข้อมูล
        }
      }
    );
  }
  
  onSubjectChange(event: any) {
    this.selectedSubjectId = event.target.value;
    this.loadChecklist(); // โหลดรายการเช็คชื่อใหม่ตามวิชาที่เลือก
  }
  

  // ส่วนอื่นๆ ที่เกี่ยวกับการลบและแก้ไขรายการเช็คชื่อ
  // ...

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

  getCurrentTime() {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }
}
