import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material';
import { Subscription } from 'rxjs';

import { Post } from '../post-list/post.model';
import { ISymbol } from '../isymbol.model';

import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})

export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageIndex = 0;
  length = 10;
  pageSizeOptions = [1, 2, 5, 10];
  ccyPairs: ISymbol[] = [];
  symbolKey = 0;
  private postsSub: Subscription;
  private symbolsSub: Subscription;

  constructor(public postsService: PostsService) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getSymbol(0);
    this.postsService.getPosts(0, this.postsPerPage, this.currentPage);
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postData: {posts: Post[], maxPosts: number}) => {
        this.isLoading = false;
        console.log('maxPosts' + postData.maxPosts);
        this.totalPosts = postData.maxPosts;
        this.posts = postData.posts;
      });

    this.symbolsSub = this.postsService
      .getSymbolsUpdateListener()
      .subscribe((postData: {symbols: ISymbol[]}) => {
        console.log(postData);
        this.ccyPairs = [...postData.symbols];
      });
  }

  public filterOnItem(newValue) {
    this.symbolKey = 0;
    if (newValue !== '') {
     const result = this.ccyPairs.find( symbol => symbol.symbol === newValue );
     this.symbolKey = parseInt(result.id, 10);
    }

    this.postsService.getPosts(this.symbolKey, this.postsPerPage, this.currentPage);
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.symbolKey,  this.postsPerPage, this.currentPage);
  }


  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.symbolsSub.unsubscribe();
  }
}
