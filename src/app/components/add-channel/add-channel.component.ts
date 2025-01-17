import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChannelService } from '../../services/channel.service';
import { ContentTypeService } from '../../services/content-type.service';
import { ContentTypeDto } from '../../models/Dtos/content-type.dto';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';
import { ApplicationUserDto } from '../../models/Dtos/application-user.dto';

@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-channel.component.html',
  styleUrls: ['./add-channel.component.css']
})
export class AddChannelComponent implements OnInit {
  newChannel = {
    userId: '',
    channelName: '',
    identifier: '',
    description: '',
    contentTypeId: 0,
    isActive: true
  };
  currentUser: ApplicationUserDto | null = null;
  contentTypes: ContentTypeDto[] = [];
  channelNameMaxLength = 100;
  identifierMaxLength = 500;
  descriptionMaxLength = 1000;
  channelNameTouched = false;
  identifierTouched = false;
  descriptionTouched = false;
  contentTypeTouched = false;

  constructor(
    private channelService: ChannelService,
    private contentTypeService: ContentTypeService,
    private router: Router,
    private toastr: ToastrService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.fetchContentTypes();
    });
  }

  fetchContentTypes(): void {
    this.contentTypeService.getContentTypes().subscribe({
      next: (fetchedContentTypes) => {
        this.contentTypes = fetchedContentTypes;
      },
      error: (error) => {
        console.error('Error fetching content types:', error);
        this.toastr.error('Failed to load content types.', 'Error');
      }
    });
  }

  handleAddChannel(): void {
    this.channelNameTouched = true;
    this.identifierTouched = true;
    this.descriptionTouched = true;
    this.contentTypeTouched = true;

    if (this.newChannel.channelName.trim() &&
        this.newChannel.identifier.trim() &&
        this.newChannel.description.trim() &&
        this.newChannel.contentTypeId &&
        this.currentUser?.id) {
      this.channelService
        .createChannel({
          ...this.newChannel,
          userId: this.currentUser.id,
        })
        .subscribe({
          next: () => {
            this.toastr.success('Channel added successfully', 'Success');
            this.router.navigate(['/channels']);
          },
          error: (error) => {
            console.error('Error adding channel:', error);
            this.toastr.error('Failed to add Channel. Please try again.', 'Error');
          }
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/channels']);
  }

  onChannelNameFocus(): void {
    this.channelNameTouched = true;
  }

  onIdentifierFocus(): void {
    this.identifierTouched = true;
  }

  onDescriptionFocus(): void {
    this.descriptionTouched = true;
  }

  onContentTypeFocus(): void {
    this.contentTypeTouched = true;
  }
}
