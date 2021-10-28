# PyTorch-BigGraph search with the Weaviate vector search engine

[PyTorch-BigGraph](https://github.com/facebookresearch/PyTorch-BigGraph) is a project by [Facebook Research](https://research.fb.com/) and a "distributed system for learning graph embeddings for large graphs" which -in turn- is based on the [PyTorch-BigGraph: A Large-scale Graph Embedding Framework paper](https://mlsys.org/Conferences/2019/doc/2019/71.pdf). As an example dataset, they [trained a PBG model on the full Wikidata graph](https://github.com/facebookresearch/PyTorch-BigGraph#pre-trained-embeddings).

In this repository, you'll find a guide on how you can import the complete Wikidata PBG model into a Weaviate and search through the entire dataset in < 50 milliseconds (excluding internet latency). The demo GraphQL queries below contain both pure vector search and scalar and vector searched mixed queries.

If you like what you see, a ⭐ on the [Weaviate Github repo](https://github.com/semi-technologies/weaviate/stargazers) is appreciated.

Additional links:

* [Weaviate documentation](https://www.semi.technology/developers/weaviate/current/)
* [Weaviate on Github](https://github.com/semi-technologies/weaviate)
* [Complete english language WikiPedia vectorized in Weaviate (similar project)](https://github.com/semi-technologies/semantic-search-through-Wikipedia-with-Weaviate)

### Acknowledgments

* The folks from [Facebook Research](https://github.com/facebookresearch) who trained the PBG
* Thanks to the team of [Obsei](https://github.com/obsei/obsei) for sharing the idea on our [Slack](https://join.slack.com/t/weaviate/shared_invite/zt-goaoifjr-o8FuVz9b1HLzhlUfyfddhw) channel

### Stats

| description | value |
| --- | --- |
| Data objects imported | `78.404.883` |
| Import time | `...` |
| Machine | `...` | 
| Weaviate version | `v1.7.2` |
| Dataset size | `113GB` |
| Average query time for 25 nearest neighbors | `...` |

Note:

* This dataset is indexed on a single Weaviate node to show the capabilities of a single Weaviate instance. You can also set up a [Weaviate Kubernetes cluster](https://www.semi.technology/developers/weaviate/current/getting-started/installation.html#kubernetes-k8s) and import the complete dataset in that way.

## Import

You can import the data yourself in two ways: by running the python script included in this repo _or_ by importing a Weaviate backup.

### Import using Python

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

You can download a backup and restore it.

```sh
$ wget 
$ gzip -d backup
$ docker-compose up -d
```

Notes:

* Weaviate needs some time to restore the backup, in the docker logs, you can see the status of the import
* This setup is tested with `Ubuntu 20.04.3 LTS` and the Weaviate version in the Docker-compose file attached

## Example queries

A bunch of example queries.

## Video

[VIDEO]