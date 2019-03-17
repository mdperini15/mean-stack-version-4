import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { Post } from '../Posts/post-list/post.model';
import { ISymbol } from './isymbol.model';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private symbols: ISymbol [] = [];
  private maxSymbols = 0;
  private symbolsUpdate = new Subject<{ symbols: ISymbol[] }>();

  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; maxPosts: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(symbolId: number, postsPerPage: number, currentPage: number) {
    const queryParams = `?symbolId=${symbolId}&pagesize=${postsPerPage}&page=${currentPage}`;
    console.log('queryParams' + queryParams);
    this.http
      .get<{ message: string; posts: any; maxPosts: number }>(
        'http://localhost:3000/api/posts' + queryParams
      )
      .pipe(
        map(postData => {
          return {
            posts: postData.posts.map(post => {
              console.log(post);
              return {
                symbol: post.symbol,
                content: post.content,
                id: post.id,
                timeStamp: post.timeStamp,
                lp: post.lp,
                bidPrice: Number(post.bidPrice) / 100000,
                bidQuantity: post.bidQuantity,
                askPrice: Number(post.askPrice) / 100000,
                askQuantity: post.askQuantity
              };
            }),
            maxPosts: postData.maxPosts
          };
        })
      )
      .subscribe(transformedPostData => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          maxPosts: transformedPostData.maxPosts
        });
      });
  }

  getSymbol(symbolId: number) {
    const queryParams = `?symbolId=${symbolId}`;
    this.http
      .get<{ message: string; symbols: any; maxSymbols: number }>(
        'http://localhost:3000/api/posts/symbols' + queryParams
      )
      .pipe(
        map( postData => {
          return {
            symbols: postData.symbols.map(data => {
              return {
                id: data.id,
                symbol: data.symbol,
                count: data.count,
                bidQuantity: data.bidQuantity,
                askQuantity: data.askQuantity
              };
            }),
          };
        })
      )
      .subscribe(transformedPostData => {
        this.symbols = transformedPostData.symbols;
        console.log(this.symbols + ' ' + this.maxSymbols);
        this.symbolsUpdate.next({
          symbols: [...this.symbols]
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getSymbolsUpdateListener() {
    return this.symbolsUpdate.asObservable();
  }




}

