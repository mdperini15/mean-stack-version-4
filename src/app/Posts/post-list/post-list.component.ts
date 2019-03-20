import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material';
import { Subscription } from 'rxjs';

import { Post } from '../post-list/post.model';
import { ISymbol } from '../isymbol.model';

import { PostsService } from '../posts.service';

declare let Plotly: any;

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

  colors = ['#01629a', '#8b1a08', '#05711a', '#cb8e00', '#614da0', '#ccca09', '#cc1b68', '#019a8d#1342a3', '#e65100', '#00d8ff' ];

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
        this.ccyPairs.forEach((ccypair) =>  {
          this.ccyPairsCounts += ccypair.count;
          this.ccyPairsBidQuantityTotals = parseFloat(this.ccyPairsBidQuantityTotals.toString()) +
                                           parseFloat(ccypair.bidQuantity.toString());
          this.ccyPairsAskQuantityTotals = parseFloat(this.ccyPairsAskQuantityTotals.toString()) +
                                           parseFloat(ccypair.askQuantity.toString());
        });

        this.showBarChartCount();
      });
    }

    showBarChartCount() {
      const _ccypairs = []
      const _count = []
      const _askQuantity = []
      const _bidQuantity  = []
      const _colors = []

      let index = 0;
      this.ccyPairs.forEach( (ccyPair) => {
        _ccypairs.push(ccyPair.symbol);
        _count.push(ccyPair.count);
        _askQuantity.push(parseFloat(ccyPair.askQuantity.toString()));
        _bidQuantity.push(parseFloat(ccyPair.bidQuantity.toString()));
        _colors.push(this.colors[index++]);
      });

      const data = [{
        type: 'bar',
        x: _ccypairs,
        y: _askQuantity,
        marker:{
          color: _colors
        },
        mode: 'markers',
        transforms: [{
          type: 'groupby',
          groups: _ccypairs
        }]
      }];

      const countTrace = {
        x: [_ccypairs[0], _ccypairs[1],_ccypairs[2], _ccypairs[3],_ccypairs[4],
         _ccypairs[5], _ccypairs[6], _ccypairs[7], _ccypairs[8], _ccypairs[9]],
        y: [_count[0], _count[1],_count[2], _count[3],_count[4], _count[5], _count[6], _count[7],  _count[8], _count[9]],
        name: 'Count',
        type: 'scatter'
      };

      const askQuantityTrace = {
        x: [_ccypairs[0], _ccypairs[1],_ccypairs[2], _ccypairs[3],_ccypairs[4],
         _ccypairs[5], _ccypairs[6], _ccypairs[7], _ccypairs[8], _ccypairs[9]],
        y: [_askQuantity[0], _askQuantity[1], _askQuantity[2], _askQuantity[3],
        _askQuantity[4], _askQuantity[5], _askQuantity[6], _askQuantity[7], _askQuantity[8], _askQuantity[9]],
        name: 'Ask Quantity',
        type: 'scatter',
      };

      const bidQuantityTrace = {
        x: [_ccypairs[0], _ccypairs[1],_ccypairs[2], _ccypairs[3],_ccypairs[4],
         _ccypairs[5], _ccypairs[6], _ccypairs[7], _ccypairs[8], _ccypairs[9]],
        y: [_bidQuantity[0], _bidQuantity[1], _bidQuantity[2], _bidQuantity[3],
        _bidQuantity[4], _bidQuantity[5], _bidQuantity[6], _bidQuantity[7],  _bidQuantity[8], _bidQuantity[9]],
        name: 'Bid Quantity',
        type: 'scatter'
      };

      const data2 = [countTrace, bidQuantityTrace, askQuantityTrace]

      const layout = {
        title: 'Order Totals Per Symbol',
        xaxis: {
          tickangle: -45
        },
        barmode: 'group',
        showlegend: true
      };

      const scatterChart = document.getElementById('scatterChart');
      if (scatterChart) {
      Plotly.newPlot(scatterChart, data2, layout);
      }
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


