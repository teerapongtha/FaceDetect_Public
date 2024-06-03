import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Student } from '../model/student.model';
import { DataService } from '../service/data.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    this.loadData();
    this.getSubjects();
  }

  getSubjects() {
    this.http.get<any[]>(this.dataService.apiUrl + '/subject-data').subscribe(
      (data) => {
        this.subjects = data;
      },
      (error) => {
        console.error('Error fetching subjects:', error);
      }
    );
  }

  onSubjectChange(event: any) {
    this.selectedSubjectId = event.target.value;
    this.loadData();
  }

  onSearchClick() {
    this.loadData();
  }

  loadData() {
    let url = this.dataService.apiUrl + '/student-data';
    
    if (this.selectedSubjectId) {
      url += `/subject/${this.selectedSubjectId}`;
    }
    
    if (this.searchQuery) {
      const encodedQuery = encodeURIComponent(this.searchQuery);
      url += this.selectedSubjectId ? `&query=${encodedQuery}` : `?query=${encodedQuery}`;
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
    this.selectedSubjectId = '';
    this.loadData();
  }

  UpdateStudent(student: any) {
    this.router.navigate(['/student-update', student.std_id]);
  }
}