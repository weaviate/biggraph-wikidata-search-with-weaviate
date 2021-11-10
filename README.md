# PyTorch-BigGraph Wikidata search with the Weaviate vector search engine

[PyTorch-BigGraph](https://github.com/facebookresearch/PyTorch-BigGraph) is a project by [Facebook Research](https://research.fb.com/) and a "distributed system for learning graph embeddings for large graphs" which -in turn- is based on the [PyTorch-BigGraph: A Large-scale Graph Embedding Framework paper](https://mlsys.org/Conferences/2019/doc/2019/71.pdf). As an example dataset, they [trained a PBG model on the full Wikidata graph](https://github.com/facebookresearch/PyTorch-BigGraph#pre-trained-embeddings).

In this repository, you'll find a guide on how you can import the complete Wikidata PBG model into a Weaviate and search through the entire dataset in < 50 milliseconds (excluding internet latency). The demo GraphQL queries below contain both pure vector search and scalar and vector searched mixed queries.

If you like what you see, a ⭐ on the [Weaviate Github repo](https://github.com/semi-technologies/weaviate/stargazers) is appreciated.

Additional links:

* [Weaviate documentation](https://www.semi.technology/developers/weaviate/current/)
* [Weaviate on Github](https://github.com/semi-technologies/weaviate)
* [Complete english language WikiPedia vectorized in Weaviate (similar project)](https://github.com/semi-technologies/semantic-search-through-Wikipedia-with-Weaviate)
* [🔥 Live Demo Weaviate Endpoint 🔥](http://biggraph-wikidata.api.demo.vectors.network:8080)
* [🔥 Live Demo HTML front-end 🔥](http://biggraph-wikidata.demo.vectors.network.vectors.network)
* [🔥 Live Demo Weaviate GraphQL front-end 🔥](#)

### Acknowledgments

* The folks from [Facebook Research](https://github.com/facebookresearch) who trained the PBG
* Thanks to the team of [Obsei](https://github.com/obsei/obsei) for sharing the idea on our [Slack](https://join.slack.com/t/weaviate/shared_invite/zt-goaoifjr-o8FuVz9b1HLzhlUfyfddhw) channel

### Stats

| description | value |
| --- | --- |
| Data objects imported | `78.404.883` |
| Machine | `8 CPU, 128Gb Mem` | 
| Weaviate version | `v1.8.0-rc.3` |
| Dataset size | `125G` |
| Average query time for 25 nearest neighbors | `...` |

Note:

* This dataset is indexed on a single Weaviate node to show the capabilities of a single Weaviate instance. You can also set up a [Weaviate Kubernetes cluster](https://www.semi.technology/developers/weaviate/current/getting-started/installation.html#kubernetes-k8s) and import the complete dataset in that way.

## Index

* Import
    * Import using Python from source
    * Restore as Weaviate backup
* Example queries
* Video

## Import

You can import the data yourself in two ways: by running the python script included in this repo _or_ by restoring a [Weaviate backup](#restore-as-weaviate-backup) (this is the fastest!).

### Import using Python from source

```sh
$ wget https://dl.fbaipublicfiles.com/torchbiggraph/wikidata_translation_v1.tsv.gz
$ gzip -d wikidata_translation_v1.tsv.gz
$ pip3 install -f requirements.txt
$ docker-compose up -d
$ python3 import.py
```

The import takes a few hours, so probably you want to do something like:

```sh
$ nohup python3 -u import.py &
```

Note:

* The script assumes that the tsv file is called: `wikidata_translation_v1.tsv`

### Restore as Weaviate backup

You can download a backup and restore it. This is by far the fastest way to get the dataset up and running

```sh
# download the Weaviate backup
$ curl https://storage.googleapis.com/semi-technologies-public-data/weaviate-1.8.0-rc.2-backup-wikipedia-pytorch-biggraph.tar.gz -O
# untar the backup (125G unpacked)
$ tar -xvzf weaviate-1.8.0-rc.2-backup-wikipedia-pytorch-biggraph.tar.gz
# get the unpacked directory
$ echo $(pwd)/var/weaviate
# use the above result (e.g., /home/foobar/weaviate-disk/var/weaviate)
#   update volumes in docker-compose.yml (NOT PERSISTENCE_DATA_PATH!) to the above output
#   (e.g., PERSISTENCE_DATA_PATH: '/home/foobar/weaviate-disk/var/weaviate:/var/lib/weaviate')
#   With 16 CPUs this process takes about 12 to 15 minutes
# start the container
$ docker-compose up -d
```

Notes:

* Weaviate needs some time to restore the backup, in the docker logs, you can see the status of the import. For more verbose information regarding the import. Add `LOG_LEVEL: 'debug'` in `docker-compose.yml`
* This setup is tested with `Ubuntu 20.04.3 LTS` and the Weaviate version in the Docker-compose file attached

## Example queries

A bunch of example queries.

## Video

[VIDEO]
