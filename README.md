node.blog
=========

A blog engine implementation written in Node.js.  The dependencies are as follows:

1. Azure Table Storage
2. In-Memory Cache
3. jQuery
4. Twitter Bootstrap

Everything is stored in-memory.  This is to make it fast, but not have to rely on something like redis.  Works for 1 instance, but if there were more, that is when it would make sense to change it.

There is a seperate admin site for it at:  https://github.com/supermitsuba/node.blog.admin
Also, there is a mobile client built in TypeScript at:  https://github.com/supermitsuba/node.blog.mobile
