# Ingesting Terminals Public Data Task
[![Build Status](https://travis-ci.org/perfectmak/etl_for_terminal_data.svg?branch=master)](https://travis-ci.org/perfectmak/etl_for_terminal_data)

## Overview
These code has two functionality:
- GraphlQL Server: Found in `server.js`
- CSV Importer: Found in `importer/index.js`.

Check them out, they are fairly commented out so you should understand how they work.

## Rationale behind the tools/languages used
My options were to use either JS, Python, any library like Pandas or PgSQL commands.

I'm more comfortable with Node.js and PgSQL commands so that is what I used.
I used Node.js to implement the GraphQL API and also to fetch and open streams to the CSV file being ingested. Because I wasn't doing much parsing on the data in the stream, I decided to use PG's `COPY` command to move the data instead of having to perform some more complex bulk insert through Node.js.

## CPU, Memory and Storage Considerations
First memory, the usecase should not require too much memory since we were basically moving data from a file to another file (SQL Storage). So I tried to use streams as much as possible to ensure only few bytes are being read from the source and sent to the destination. And memory was constant through my tests

Although, the way the importer is currently designed, multiple processes can be ingesting data at the same time, Node.js is still single threaded and therefore limits the speed of indexing.
Loading and indexing by PgSQL is CPU intensive and therefore there was spikes in CPU usage while copying the data over.

Here, I'm only considering persistent Storage used by PgSQL. I ensure column type were not too larger than what was required, although some of the csv data were not consistent so I had to use some little over-estimates at some point. 

Also I avoided using too much indexes and foreign key constraints, except for those required to make the GraphQL API lookups faster. This is to reduce unnecessary space and also because the referential integraty between tokens and transfers are not a priority and this would also allow indexing in no particular order (therefore speeding things up).

## Performance Metrics
The way the data sources table is setup, the importer can either open a stream
directly to the file on GCS or open a stream to a file locally.

Because of my bandwith constraint, I was unable to test both options for all files in the bucket (at least not on the same machine), so I ran a performance test on a subset of the files (100 and size ~9GB).

Streaming the files directly from GCS was taking too long, so I cancelled it :(, 
but Streaming the files from the local filesystem was faster and was able to ingest it at an average of 3 mins.

**Specs of the Machine Use**:
Core i7 2.8 GHz,
Memory: 16GB,
SDD Storage.

If you want to run the metric, you can run either `make run-benchmark-fs`, this would download the files to your local container and ingest from there or else run `make run-benchmark-gs` this would open a stream to read each file from directly from GS. 

## CI, Preferred Deployment Flow and Stack
I would prefer to used (Docker) containers to deploy this service.
The repository already has a Dockerfile to package and create an image ready to run either one or both of the importer and graphql services.

For local development and running tests on a CI server, docker-compose is used to orchestrate dependencies and make things easier. Take a look at the `Makefile` and `.travis.yml` to see the commands to do this.

For deployment, once the tests pass on the CI server, the built image would be uploaded to a image registery and the production server would pick it and run the new container with the new dependecy.

In production, orchestrating dependecies would still be based around containers, since there is only one external dependency (the database), I'll probably setup a managed service for that on AWS and then deploy the image to a server that would run the container and point to the database in its config.

Also, because of the way the app is structured, the same image can be deployed to multiple servers, one would be the GraphlQL web service and many others can be deployed as background workers who sole job is to ingest data from the data source, this would also speed up ingesting.

## Conclusion
Node.js is great for IO and event driven operations, but not good for high intensity CPU operations and transformations. Also, it requires extra work to perform some parallel operations and with the way the event system works may also make things a little bit undeterministic. But for the GraphQL API, Node.js works fine, validating the request and fetching the data from the underlying database. An optimization might be to eager load the underlying token to a token_transfer.

## License
Education ✌🏽

