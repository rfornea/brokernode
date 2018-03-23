package jobs_test

import (
	"github.com/gobuffalo/suite"
	"github.com/iotaledger/giota"
	"github.com/oysterprotocol/brokernode/models"
	"github.com/oysterprotocol/brokernode/services"
	"testing"
)

var IotaMock services.IotaService

type JobsSuite struct {
	*suite.Model
}

func (suite *JobsSuite) SetupSuite() {

	/*
		This creates a "generic" mock of our iota wrapper. we can assign
		different mocking functions in individual test files.
	*/

	IotaMock = services.IotaService{
		ProcessChunks: func(chunks []models.DataMap, attachIfAlreadyAttached bool) {

		},
		VerifyChunkMessagesMatchRecord: func(chunks []models.DataMap) (filteredChunks services.FilteredChunk, err error) {

			emtpyChunkArray := []models.DataMap{}

			return services.FilteredChunk{
				MatchesTangle:      emtpyChunkArray,
				NotAttached:        emtpyChunkArray,
				DoesNotMatchTangle: emtpyChunkArray,
			}, err
		},
		VerifyChunksMatchRecord: func(chunks []models.DataMap, checkChunkAndBranch bool) (filteredChunks services.FilteredChunk, err error) {
			emtpyChunkArray := []models.DataMap{}

			return services.FilteredChunk{
				MatchesTangle:      emtpyChunkArray,
				NotAttached:        emtpyChunkArray,
				DoesNotMatchTangle: emtpyChunkArray,
			}, err
		},
		ChunksMatch: func(chunkOnTangle giota.Transaction, chunkOnRecord models.DataMap, checkBranchAndTrunk bool) bool {
			return false
		},
	}
}

//
//func (suite *JobsSuite) TearDownSuite() {
//}
//
//func (suite *JobsSuite) SetupTest() {
//}
//
//func (suite *JobsSuite) TearDownTest() {
//}

func Test_JobsSuite(t *testing.T) {

	as := &JobsSuite{suite.NewModel()}
	suite.Run(t, as)
}
