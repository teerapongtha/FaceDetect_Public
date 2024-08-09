import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as faceapi from 'face-api.js';
import { DataService } from '../service/data.service';

@Component({
  selector: 'app-face-detect',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  providers: [DataService],
  templateUrl: './face-detect.component.html',
  styleUrls: ['./face-detect.component.scss']
})
export class FaceDetectComponent implements AfterViewInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  imgStdData: any[] = [];
  verificationResult: any = null;

  constructor(
    private dataService: DataService,
    private http: HttpClient,
    private router: Router
  ) {}

  async ngAfterViewInit() {
    await this.loadFaceAPIModels();
    this.startVideo();
    this.fetchImageData();
  }

  async loadFaceAPIModels() {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/assets/models')
    ]);
    console.log('โหลดโมเดล Face API เสร็จสิ้น');
  }

  startVideo() {
    const video = this.videoElement.nativeElement;

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        console.log('เริ่มวิดีโอ');
      })
      .catch(err => console.error('เกิดข้อผิดพลาดในการเข้าถึงกล้อง:', err));

    video.addEventListener('play', () => {
      const canvas = this.canvasElement.nativeElement;
      const displaySize = { width: video.width, height: video.height };
      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        // No drawing on canvas
        // Instead, you may choose to handle detection results here if needed
        // Example: console.log(detections);
      }, 100);
    });
  }

  fetchImageData() {
    this.http.get<any[]>(`${this.dataService.apiUrl}/face-detect-img`).subscribe(
      (data: any[]) => {
        this.imgStdData = data;
        console.log('ดึงข้อมูลรูปภาพสำเร็จ');
      },
      (error) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ:', error);
      }
    );
  }

  findMatchingUser(faceDescriptor: any) {
    // Define the maximum descriptor distance for matching
    const maxDescriptorDistance = 0.6; // Adjust this value as needed
    let bestMatch: any = null;
  
    this.imgStdData.forEach((userData) => {
      const savedDescriptor = JSON.parse(userData.extract_feature);
  
      if (faceDescriptor.length === savedDescriptor.length) {
        const distance = faceapi.euclideanDistance(faceDescriptor, savedDescriptor);
  
        console.log(`ระยะทางไปยัง ${userData.fname} ${userData.lname}: ${distance}`);
  
        if (distance <= maxDescriptorDistance) {
          if (!bestMatch || distance < bestMatch.distance) {
            bestMatch = { userData, distance };
          }
        }
      } else {
        console.warn('ความยาวของ descriptors ไม่ตรงกัน');
      }
    });
  
    return bestMatch ? bestMatch : null;
  }
  
  async verifyFace() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
  
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
  
    const resizedDetections = faceapi.resizeResults(detections, faceapi.matchDimensions(canvas, { width: video.width, height: video.height }));
    const faceDescriptor = resizedDetections.length > 0 ? resizedDetections[0].descriptor : null;
  
    if (faceDescriptor) {
      const matchingUser = this.findMatchingUser(faceDescriptor);
      if (matchingUser) {
        const userData = matchingUser.userData;
        const distance = matchingUser.distance;
        const fname = userData?.fname ?? 'ไม่พบชื่อ';
        const lname = userData?.lname ?? 'ไม่พบนามสกุล';
  
        this.verificationResult = {
          fname,
          lname,
          distance: distance.toFixed(2),
          match: distance <= 0.6 // Ensure this threshold matches your `maxDescriptorDistance`
        };
      } else {
        this.verificationResult = { fname: 'ไม่พบชื่อ', lname: 'ไม่พบนามสกุล', distance: 'N/A', match: false };
      }
    } else {
      this.verificationResult = { fname: 'ไม่พบชื่อ', lname: 'ไม่พบนามสกุล', distance: 'N/A', match: false };
    }
  }
  
}
