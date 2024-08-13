import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../service/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // Import module

@Component({
  selector: 'app-attendance-record',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  providers: [DataService],
  templateUrl: './attendance-record.component.html',
  styleUrls: ['./attendance-record.component.scss']
})
export class AttendanceRecordComponent implements OnInit {
  checklist: any;
  attendanceDetails: any[] = [];
  checklistId: any;
  searchText: string = '';
  p: number = 1; // ตัวแปรสำหรับการแบ่งหน้า

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit() {
    // Get checklist_id from route parameters
    this.route.params.subscribe(params => {
      this.checklistId = +params['id'];
      this.loadChecklistData();
    });
  }

  loadChecklistData() {
    const url = `${this.dataService.apiUrl}/attendance-record/${this.checklistId}`;
    this.http.get(url).subscribe(
      (data: any) => {
        this.checklist = data.title;
        this.attendanceDetails = data.attendance_details;
      },
      error => {
        console.error('Error fetching attendance record:', error);
      }
    );
  }

  filteredDetails() {
    const searchText = this.searchText.toLowerCase();
    return this.attendanceDetails.filter(detail => 
      (detail.std_id ? detail.std_id.toString().toLowerCase().includes(searchText) : false) ||
      (detail.std_name ? detail.std_name.toLowerCase().includes(searchText) : false)
    );
  }

  resetSearch() {
    this.searchText = '';
    this.p = 1;
  }

  goBack() {
    this.router.navigate(['/checklist-manage']);
  }
}
