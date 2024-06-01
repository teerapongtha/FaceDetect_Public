import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Student } from '../model/student.model';
import { DataService } from '../service/data.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-manage',
  standalone: true,
  imports: [RouterLink, CommonModule],
  providers: [DataService],
  templateUrl: './student-manage.component.html',
  styleUrl: './student-manage.component.scss'
})
export class StudentManageComponent implements OnInit {
  students: Student[] = [];
  totalStudents: number = 0;

  constructor(private dataService: DataService, private http: HttpClient,private route:Router) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http.get<any[]>(this.dataService.apiUrl + "/student-data").subscribe(
      (data: any[]) => {
        this.students = data;
        this.totalStudents = this.students.length;
      },
      (error) => {
        console.error('Error fetching students:', error);
      }
    );
  }
  UpdateStudent(student: any) {
    this.route.navigate(['/student-update', student.std_id]);
  }
}
