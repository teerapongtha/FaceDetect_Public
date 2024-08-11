import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Student } from '../model/student.model';
import { DataService } from '../service/data.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-student-manage',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  providers: [DataService],
  templateUrl: './student-manage.component.html',
  styleUrls: ['./student-manage.component.scss']
})
export class StudentManageComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  totalStudents: number = 0;
  subjects: any[] = [];
  selectedSubjectId: any = '';
  searchQuery: string = '';

  constructor(private dataService: DataService, private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.getSubjects();
  }

  getSubjects() {
    this.dataService.getUserData().subscribe(userData => {
      if (userData) {
        const user_id = userData.teacher_id;
        this.http.get<any[]>(`${this.dataService.apiUrl}/subjects/${user_id}`).subscribe(
          (data) => {
            this.subjects = data;
          },
          (error) => {
            console.error('Error fetching subjects:', error);
          }
        );
      } else {
        console.error('ไม่พบข้อมูลผู้ใช้');
      }
    });
  }

  onSubjectChange(event: any) {
    this.selectedSubjectId = event.target.value;
    this.loadData();
  }

  onSearchClick() {
    this.loadData();
  }

  loadData() {
    if (!this.selectedSubjectId) {
      this.students = [];
      this.filteredStudents = [];
      this.totalStudents = 0;
      return;
    }

    let url = `${this.dataService.apiUrl}/student-data/subject/${this.selectedSubjectId}`;
    
    if (this.searchQuery) {
      const encodedQuery = encodeURIComponent(this.searchQuery);
      url += `?query=${encodedQuery}`;
    }

    this.http.get<Student[]>(url).subscribe(
      (data: Student[]) => {
        this.students = data;
        this.filteredStudents = data;
        this.totalStudents = data.length;
        this.filterStudents();
      },
      (error) => {
        console.error('Error fetching students:', error);
      }
    );
  }

  filterStudents() {
    if (!this.searchQuery) {
      this.filteredStudents = this.students;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredStudents = this.students.filter(student =>
        student.std_id.toString().toLowerCase().includes(query) ||
        `${student.fname} ${student.lname}`.toLowerCase().includes(query)
      );
    }
  }

  onResetClick() {
    this.searchQuery = '';
    this.loadData();
  }

  UpdateStudent(student: any) {
    this.router.navigate(['/student-update', student.std_id]);
  }

  deleteStudent(std_id: any) {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: "คุณต้องการลบข้อมูลนิสิตนี้หรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.dataService.apiUrl}/student-delete/${std_id}`).subscribe(
          () => {
            // รีโหลดข้อมูลหลังจากลบเสร็จ
            this.loadData();
            Swal.fire(
              'ลบแล้ว!',
              'ข้อมูลนิสิตถูกลบแล้ว.',
              'success'
            );
          },
          (error) => {
            console.error('Error deleting student:', error);
            Swal.fire(
              'ข้อผิดพลาด!',
              'ไม่สามารถลบข้อมูลนิสิตได้.',
              'error'
            );
          }
        );
      }
    });
  }
  
}
