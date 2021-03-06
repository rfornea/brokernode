package models

import (
	"crypto/sha256"
	"crypto/sha512"
	"encoding/json"
	"math/rand"

	"time"

	"github.com/oysterprotocol/brokernode/utils"

	"github.com/gobuffalo/pop"
	"github.com/gobuffalo/uuid"
	"github.com/gobuffalo/validate"
	"github.com/gobuffalo/validate/validators"
)

const FileBytesChunkSize = float64(2187)
const MaxSideChainLength = 1000 // need to determine what this number should be

const (
	Pending int = iota + 1
	Unassigned
	Unverified
	Complete
	Confirmed
	Error = -1
)

type DataMap struct {
	ID             uuid.UUID `json:"id" db:"id"`
	CreatedAt      time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt      time.Time `json:"updatedAt" db:"updated_at"`
	Status         int       `json:"status" db:"status"`
	NodeID         string    `json:"nodeID" db:"node_id"`
	NodeType       string    `json:"nodeType" db:"node_type"`
	Message        string    `json:"message" db:"message"`
	TrunkTx        string    `json:"trunkTx" db:"trunk_tx"`
	BranchTx       string    `json:"branchTx" db:"branch_tx"`
	GenesisHash    string    `json:"genesisHash" db:"genesis_hash"`
	ChunkIdx       int       `json:"chunkIdx" db:"chunk_idx"`
	Hash           string    `json:"hash" db:"hash"`
	ObfuscatedHash string    `json:"obfuscatedHash" db:"obfuscated_hash"`
	Address        string    `json:"address" db:"address"`
}

func init() {
}

// String is not required by pop and may be deleted
func (d DataMap) String() string {
	jd, _ := json.Marshal(d)
	return string(jd)
}

// DataMaps is not required by pop and may be deleted
type DataMaps []DataMap

// String is not required by pop and may be deleted
func (d DataMaps) String() string {
	jd, _ := json.Marshal(d)
	return string(jd)
}

// Validate gets run every time you call a "pop.Validate*" (pop.ValidateAndSave, pop.ValidateAndCreate, pop.ValidateAndUpdate) method.
// This method is not required and may be deleted.
func (d *DataMap) Validate(tx *pop.Connection) (*validate.Errors, error) {
	return validate.Validate(
		&validators.StringIsPresent{Field: d.GenesisHash, Name: "GenesisHash"},
		&validators.IntIsGreaterThan{Field: d.ChunkIdx, Name: "ChunkIdx", Compared: -1},
		&validators.StringIsPresent{Field: d.Hash, Name: "Hash"},
	), nil
}

// ValidateCreate gets run every time you call "pop.ValidateAndCreate" method.
// This method is not required and may be deleted.
func (d *DataMap) ValidateCreate(tx *pop.Connection) (*validate.Errors, error) {
	return validate.NewErrors(), nil
}

// ValidateUpdate gets run every time you call "pop.ValidateAndUpdate" method.
// This method is not required and may be deleted.
func (d *DataMap) ValidateUpdate(tx *pop.Connection) (*validate.Errors, error) {
	return validate.NewErrors(), nil
}

// BuildDataMaps builds the datamap and inserts them into the DB.
func BuildDataMaps(genHash string, fileTryteSize int) (vErr *validate.Errors, err error) {
	fileChunksCount := oyster_utils.GetTotalFileChunkIncludingBuriedPearls(oyster_utils.ConvertToByte(fileTryteSize))

	currHash := genHash
	for i := 0; i < fileChunksCount; i++ {
		// TODO: Batch these inserts.

		obfuscatedHash := oyster_utils.HashString(currHash, sha512.New384())
		currAddr := string(oyster_utils.MakeAddress(obfuscatedHash))

		vErr, err = DB.ValidateAndCreate(&DataMap{
			GenesisHash:    genHash,
			ChunkIdx:       i,
			Hash:           currHash,
			ObfuscatedHash: obfuscatedHash,
			Address:        currAddr,
			Status:         Pending,
		})

		currHash = oyster_utils.HashString(currHash, sha256.New())
	}

	return
}

/*@TODO is this file the best place for this method?*/
func CreateTreasurePayload(ethereumSeed string, sha256Hash string, maxSideChainLength int) (string, error) {
	keyLocation := rand.Intn(maxSideChainLength)

	currentHash := sha256Hash
	for i := 0; i < keyLocation; i++ {
		currentHash = oyster_utils.HashString(currentHash, sha512.New())
	}

	encryptedResult := oyster_utils.Encrypt(currentHash, ethereumSeed)
	return string(oyster_utils.BytesToTrytes([]byte(encryptedResult))), nil
}
