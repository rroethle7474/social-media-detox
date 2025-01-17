import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChannelService } from '../../services/channel.service';
import { ChannelDto } from '../../models/Dtos/channel.dto';
import { ContentTypeService } from '../../services/content-type.service';
import { ContentTypeDto } from '../../models/Dtos/content-type.dto';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user.service';
import { ApplicationUserDto } from '../../models/Dtos/application-user.dto';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './channel.component.html',
})
export class ChannelComponent implements OnInit {
  channels: ChannelDto[] = [];
  editingChannel: ChannelDto | null = null;
  editedChannelName: string = '';
  editedIdentifier: string = '';
  editedDescription: string = '';
  editedIsActive: boolean = false;
  editedContentTypeId: number | null = null;
  currentUser: ApplicationUserDto | null = null;
  contentTypes: ContentTypeDto[] = [];
  channelNameMaxLength = 100;
  identifierMaxLength = 500;
  descriptionMaxLength = 1000;

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
      this.fetchChannels();
      this.fetchContentTypes();
    });
  }

  fetchChannels(): void {
    if (this.currentUser?.id) {
      this.channelService.getChannels({ userId: this.currentUser.id }).subscribe({
        next: (fetchedChannels) => {
          this.channels = fetchedChannels;
        },
        error: (error) => {
          console.error('Error fetching channels:', error);
          this.toastr.error('Failed to load channels.', 'Error');
        }
      });
    }
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

  handleEditChannel(channel: ChannelDto): void {
    this.editingChannel = channel;
    this.editedChannelName = channel.channelName;
    this.editedIdentifier = channel.identifier;
    this.editedDescription = channel.description;
    this.editedIsActive = channel.isActive;
    this.editedContentTypeId = channel.contentTypeId;
  }

  handleSaveEdit(): void {
    if (this.editingChannel &&
        this.editedChannelName.trim() !== '' &&
        this.editedIdentifier.trim() !== '' &&
        this.editedDescription.trim() !== '' &&
        this.editedContentTypeId) {
      if (this.editedChannelName.length > this.channelNameMaxLength ||
          this.editedIdentifier.length > this.identifierMaxLength ||
          this.editedDescription.length > this.descriptionMaxLength) {
        this.toastr.error('One or more fields exceed the maximum length.', 'Error');
        return;
      }
      this.channelService.updateChannel({
        ...this.editingChannel,
        channelName: this.editedChannelName.trim(),
        identifier: this.editedIdentifier.trim(),
        description: this.editedDescription.trim(),
        isActive: this.editedIsActive,
        contentTypeId: this.editedContentTypeId,
      }).subscribe({
        next: () => {
          this.fetchChannels();
          this.cancelEdit();
          this.toastr.success('Channel updated successfully', 'Success');
        },
        error: (error) => {
          console.error('Error updating channel:', error);
          this.toastr.error('Failed to update Channel. Please try again.', 'Error');
        }
      });
    } else {
      this.toastr.error('Please provide valid values for all fields.', 'Error');
    }
  }

  cancelEdit(): void {
    this.editingChannel = null;
    this.editedChannelName = '';
    this.editedIdentifier = '';
    this.editedDescription = '';
    this.editedIsActive = false;
    this.editedContentTypeId = null;
  }

  handleDeleteChannel(id: number): void {
    if (confirm('Are you sure you want to delete this channel?')) {
      this.channelService.deleteChannel(id).subscribe({
        next: () => {
          this.fetchChannels();
          this.toastr.success('Channel deleted successfully', 'Success');
        },
        error: (error) => {
          console.error('Error deleting channel:', error);
          this.toastr.error('Failed to delete Channel. Please try again.', 'Error');
        }
      });
    }
  }

  navigateToAddChannel(): void {
    this.router.navigate(['/add-channel']);
  }
}
