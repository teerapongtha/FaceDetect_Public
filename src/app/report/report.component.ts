import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../service/data.service';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, MatDatepickerModule],
  providers: [DataService],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  subjects: any[] = [];
  reportData: any[] = [];
  filteredReportData: any[] = [];
  selectedSubjectId: string = '';
  selectedDate: string = '';

  constructor(private http: HttpClient, private dataService: DataService) {}

  ngOnInit(): void {
    this.fetchSubjects();
  }

  fetchSubjects() {
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

  onSubjectChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedSubjectId = selectElement.value;

    if (this.selectedSubjectId) {
      this.http.get<any[]>(`${this.dataService.apiUrl}/report-summary/${this.selectedSubjectId}`).subscribe((data: any[]) => {
        this.reportData = data;
        this.applyFilters();
      });
    }
  }

  onDateChange() {
    this.applyFilters();
  }

  applyFilters() {
    if (this.selectedDate) {
      this.filteredReportData = this.reportData.filter(entry => entry.date === this.selectedDate);
    } else {
      this.filteredReportData = this.reportData;
    }
  }

  resetFilters() {
    this.selectedDate = '';
    this.applyFilters();
  }

  exportReport() {
    if (this.selectedSubjectId) {
      const url = `${this.dataService.apiUrl}/export-report/${this.selectedSubjectId}`;
      window.location.href = url;
    } else {
      alert('กรุณาเลือกรายวิชาก่อนทำการส่งออก');
    }
  }

  formatDateThai(date: string): string {
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const [year, month, day] = date.split('-');
    const thaiYear = +year + 543;
    const thaiMonth = months[+month - 1];
    return `${day} ${thaiMonth} ${thaiYear}`;
  }
}
