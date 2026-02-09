import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IpAdressPage } from './socket';

describe('IpAdressPage', () => {
  let component: IpAdressPage;
  let fixture: ComponentFixture<IpAdressPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IpAdressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
