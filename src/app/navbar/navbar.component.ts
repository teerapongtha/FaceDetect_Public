import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../service/data.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  providers: [DataService],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy, AfterViewInit {
  userData: any;
  menuOpen: boolean = false;
  private userDataSubscription: Subscription | undefined;
  status: boolean = false;

  constructor(private dataService: DataService, private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.userDataSubscription = this.dataService.getUserData().subscribe((userData) => {
      this.userData = userData;
    });
    this.addActiveClassOnPageLoad();
  }

  ngAfterViewInit(): void {
    setTimeout(() => { this.test(); }, 0);
  }

  ngOnDestroy() {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    setTimeout(() => { this.test(); }, 500);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    localStorage.removeItem('acId');
    localStorage.removeItem('userData');
    localStorage.removeItem('Data');
    this.dataService.setAcId(null);
    this.dataService.setUserData(null);
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  clickEvent() {
    this.status = !this.status;
  }

  test(): void {
    const tabsNewAnim = document.getElementById('navbarSupportedContent');
    const activeItemNewAnim = tabsNewAnim?.querySelector('.active') as HTMLElement;
    const activeWidthNewAnimHeight = activeItemNewAnim?.offsetHeight;
    const activeWidthNewAnimWidth = activeItemNewAnim?.offsetWidth;
    const itemPosNewAnimTop = activeItemNewAnim?.offsetTop;
    const itemPosNewAnimLeft = activeItemNewAnim?.offsetLeft;
    const horiSelector = document.querySelector('.hori-selector') as HTMLElement;

    if (horiSelector) {
      horiSelector.style.top = `${itemPosNewAnimTop}px`;
      horiSelector.style.left = `${itemPosNewAnimLeft}px`;
      horiSelector.style.height = `${activeWidthNewAnimHeight}px`;
      horiSelector.style.width = `${activeWidthNewAnimWidth}px`;
    }

    tabsNewAnim?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const parentLi = target.closest('li');
      if (parentLi) {
        tabsNewAnim.querySelectorAll('li').forEach(li => li.classList.remove('active'));
        parentLi.classList.add('active');
        const activeWidthNewAnimHeight = parentLi.offsetHeight;
        const activeWidthNewAnimWidth = parentLi.offsetWidth;
        const itemPosNewAnimTop = parentLi.offsetTop;
        const itemPosNewAnimLeft = parentLi.offsetLeft;

        if (horiSelector) {
          horiSelector.style.top = `${itemPosNewAnimTop}px`;
          horiSelector.style.left = `${itemPosNewAnimLeft}px`;
          horiSelector.style.height = `${activeWidthNewAnimHeight}px`;
          horiSelector.style.width = `${activeWidthNewAnimWidth}px`;
        }
      }
    });
  }

  addActiveClassOnPageLoad(): void {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const target = document.querySelector(`#navbarSupportedContent ul li a[href="${path}"]`);
    target?.parentElement?.classList.add('active');
  }
}
