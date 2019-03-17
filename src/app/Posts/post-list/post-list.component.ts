import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material';
import { Subscription } from 'rxjs';

import { Post } from '../post-list/post.model';
import { ISymbol, ISymbolTotals } from '../isymbol.model';

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
  ccyPairsTotals = 0;
  ccyPairsCounts = 0;
  ccyPairsBidQuantityTotals = 0;
  ccyPairsAskQuantityTotals = 0;
  ccyPairsBidQuantityTotalsStr = '';
  ccyPairsAskQuantityTotalsStr = '';
  symbolKey = 0;
  private postsSub: Subscription;
  private symbolsSub: Subscription;

  constructor(public postsService: PostsService) {}

  // toFixed(x) {
  //   if (Math.abs(x) < 1.0) {
  //     let e = parseInt(x.toString().split('e-')[1]);
  //     if (e) {
  //         x *= Math.pow(10,e-1);
  //         x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
  //     }
  //   } else {
  //     let e = parseInt(x.toString().split('+')[1]);
  //     if (e > 20) {
  //         e -= 20;
  //         x /= Math.pow(10,e);
  //         x += (new Array(e+1)).join('0');
  //     }
  //   }
  //   return x;
  // }

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
        this.ccyPairs.forEach((ccypair) =>  {
          this.ccyPairsCounts += ccypair.count;
          this.ccyPairsBidQuantityTotals = parseFloat(this.ccyPairsBidQuantityTotals.toString()) +
                                           parseFloat(ccypair.bidQuantity.toString());
          this.ccyPairsAskQuantityTotals = parseFloat(this.ccyPairsAskQuantityTotals.toString()) +
                                           parseFloat(ccypair.askQuantity.toString());
        });
      });
    }

    // formatMike(num: number) {
    //   return Math.round(num * 100) / 100;
    // }

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
