"""
This import file, imports the PyTorch-BigGraph dataset from facebookresearch to a Weaviate
"""
import weaviate
from loguru import logger

def create_weaviate_schema():
    """
    Empties a Weaviate and create a schema
    """

    # flush the schema and data
    CLIENT.schema.delete_all()
    # create schema
    schema = {
        "classes": [
            {
                "class": "Entity",
                "vectorIndexConfig": {
                    "vectorCacheMaxObjects": 150000000000
                },
                "description": "A Wikidata Entity",
                "properties": [
                    {
                        "dataType": [
                            "string"
                        ],
                        "description": "URL of the entity",
                        "name": "url",
                        "indexInverted": True
                    }
                ]
            },
            {
                "class": "Label",
                "description": "A wikidata label",
                "vectorIndexConfig": {
                    "vectorCacheMaxObjects": 150000000000
                },
                "properties": [
                    {
                        "dataType": [
                            "string"
                        ],
                        "description": "The content of the label",
                        "name": "content",
                        "indexInverted": True
                    },
                    {
                        "dataType": [
                            "string"
                        ],
                        "description": "The language of the label",
                        "name": "language",
                        "indexInverted": True
                    }
                ]
            }
        ]
    }
    CLIENT.schema.create(schema)


def str_to_float(line_parsed):
    """
    Converts an array of strings to an array of floats

    Returns
    --------
    array
        An array of floats
    """

    return_array = []
    for floating in line_parsed:
        return_array.append(float(floating))
    return return_array


def parse_line_to_object(line):
    """
    Parses an import line to an objects

    Returns
    --------
    dict
        Object that contains all the Wikidata to add it to a Weaviate
    """

    return_object = {}
    line_parsed = line.strip().split("\t")
    if line_parsed[0].startswith("<"):
        # remove <> from entity
        return_object["entity_url"] = line_parsed[0][1:-1]
    else:
        # split the label and the language
        line_parsed_and_splitted = line_parsed[0].split("@")
        return_object["label"] = line_parsed_and_splitted[0][1:-1]
        return_object["label_language"] = None
        if len(line_parsed_and_splitted) > 1:
            return_object["label_language"] = line_parsed_and_splitted[1]
    # add the vectors
    del line_parsed[0]
    return_object["vectors"] = str_to_float(line_parsed)
    return return_object


def create_weaviate_import_obj(line_obj):
    """
    Creates an import objects that fits a Weaviatae

    Returns
    --------
    dict
        Object that fits the Weaviate import model
    """

    weaviate_import_object = []
    # check if entity, else it is a label
    if "entity_url" in line_obj:
        weaviate_import_object.append({ "url": line_obj["entity_url"] })
        weaviate_import_object.append("Entity")
    else:
        weaviate_import_object.append({
            "content": line_obj["label"].encode().decode("unicode-escape"),
            "language": line_obj["label_language"] }
        )
        weaviate_import_object.append("Label")
    # append the vectors that represent the entity or label
    weaviate_import_object.append(line_obj["vectors"])
    return weaviate_import_object


def create_data_objects():
    """
    Creates data object inside a Weaviate using batch
    """

    with open(WIKI_DATA_FILE, encoding="utf-8") as import_lines:
        count = 0
        for line in import_lines:
            count += 1
            # skip the first line
            if count == 1:
                continue
            line_obj = parse_line_to_object(line)
            try:
                weaviate_import_object = create_weaviate_import_obj(line_obj)
            except:
                logger.info("Something went wrong creating the object")
                continue
            # do batch import
            CLIENT.batch.add_data_object(
                weaviate_import_object[0],
                weaviate_import_object[1],
                None,
                weaviate_import_object[2]
            )
            # if batch has size of 1k add them
            if count % 250 == 0:
                try:
                    CLIENT.batch.create_objects()
                except:
                    logger.info("Something went wrong with th batch")
                    pass
                logger.info("Imported: " + str(count) + " items")
        # add last in batch
        CLIENT.batch.create_objects()


logger.info("Start import")
# wiki data file
WIKI_DATA_FILE = "wikidata_translation_v1.tsv"
# connect Weaviate
CLIENT = weaviate.Client("http://localhost:8080")
# create schema
create_weaviate_schema()
# create data objects in batch
create_data_objects()
# done
logger.info("Done")
