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

  constructor(private dataService: DataService, private http: HttpClient, private route: Router) { }

  ngOnInit() {
    this.getUserData();
    this.getCurrentTime();
  }

  // Get user data and subjects
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

  // Get subjects for the student
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

  // Load checklists based on the selected subject
  loadChecklist() {
    if (!this.selectedSubjectId) {
      this.checklists = [];
      this.filteredChecklists = [];
      return;
    }

    const url = `${this.dataService.apiUrl}/checklist-data/student/${this.user_id}/subject/${this.selectedSubjectId}`;

    this.http.get<Checklist[]>(url).subscribe(
      (data) => {
        this.checklists = data;
        this.applySearch(); // Apply search after loading checklists
      },
      (error) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลเช็คชื่อ:', error);
        if (error.status === 404) {
          this.checklists = [];
          this.filteredChecklists = [];
        }
      }
    );
  }

  // Handle subject change
  onSubjectChange(event: any) {
    this.selectedSubjectId = event.target.value;
    this.loadChecklist();
  }

  // Apply search filter
  searchChecklist() {
    this.applySearch();
  }

  // Get subject name based on subject_id
  getSubjectName(subject_id: any): string {
    const subject = this.subjects.find(s => s.subject_id === subject_id);
    return subject ? subject.subject_name : '';
  }

  // Format date to Thai format
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

  // Update current time every second
  getCurrentTime() {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  // Apply search filter
  applySearch() {
    this.filteredChecklists = this.checklists.filter(checklist => {
      const matchesTitle = checklist.title.toLowerCase().includes(this.searchTitle.toLowerCase());
      const matchesDate = this.searchDate ? checklist.date === this.searchDate : true;
      return matchesTitle && matchesDate;
    });
  }

  // Reset search filters
  resetSearch() {
    this.searchTitle = '';
    this.searchDate = '';
    this.applySearch();
  }
}
