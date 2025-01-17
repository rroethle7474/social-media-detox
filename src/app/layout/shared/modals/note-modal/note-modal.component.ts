import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../../../../services/note-service';
import { NoteDto } from '../../../../models/Dtos/note.dto';
import { SearchResultDto } from '../../../../models/Dtos/search-result.dto';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-note-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-modal.component.html',
  styleUrls: ['./note-modal.component.css']
})
export class NoteModalComponent implements OnInit {
  @Input() searchResult!: SearchResultDto;
  @Input() currentUserId!: string;
  notes: NoteDto[] = [];
  editingNote: NoteDto | null = null;
  newNote: Omit<NoteDto, 'id'> = { title: '', message: '', searchResultId: 0, userId: '' };
  titleMaxLength = 100;
  messageMaxLength = 1000;
  titleTouched = false;
  messageTouched = false;

  constructor(
    public activeModal: NgbActiveModal,
    private noteService: NoteService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadNotes();
    this.newNote.searchResultId = this.searchResult.id;
    this.newNote.userId = this.currentUserId;
  }

  loadNotes() {
    const request = { searchResultId: this.searchResult.id };
    this.noteService.getNotes(request).subscribe({
      next: (notes) => {
        this.notes = notes;
      },
      error: (error) => {
        console.error('Error loading notes:', error);
        this.toastr.error('Error loading notes');
      }
    });
  }

  startEditing(note: NoteDto) {
    this.editingNote = { ...note };
  }

  saveEdit() {
    if (this.editingNote) {
      this.noteService.updateNote(this.editingNote).subscribe({
        next: () => {
          this.toastr.success('Note updated successfully');
          this.loadNotes();
          this.editingNote = null;
        },
        error: (error) => {
          console.error('Error updating note:', error);
          this.toastr.error('Error updating note');
        }
      });
    }
  }

  cancelEdit() {
    this.editingNote = null;
  }

  deleteNote(note: NoteDto) {
    this.noteService.deleteNote(note.id).subscribe({
      next: () => {
        this.toastr.success('Note deleted successfully');
        this.loadNotes();
      },
      error: (error) => {
        console.error('Error deleting note:', error);
        this.toastr.error('Error deleting note');
      }
    });
  }

  addNote() {
    if (this.newNote.title.trim() && this.newNote.message.trim()) {
      this.noteService.createNote(this.newNote).subscribe({
        next: () => {
          this.toastr.success('Note added successfully');
          this.loadNotes();
          this.newNote.title = '';
          this.newNote.message = '';
          this.titleTouched = false;
          this.messageTouched = false;
        },
        error: (error) => {
          console.error('Error adding note:', error);
          this.toastr.error('Error adding note');
        }
      });
    } else {
      this.titleTouched = true;
      this.messageTouched = true;
      this.toastr.error('Please fill in both title and message');
    }
  }

  close() {
    this.activeModal.dismiss('Cross click');
  }

  onTitleFocus(): void {
    this.titleTouched = true;
  }

  onMessageFocus(): void {
    this.messageTouched = true;
  }
}
