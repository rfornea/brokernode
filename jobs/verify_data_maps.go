package jobs

import (
	raven "github.com/getsentry/raven-go"
	"github.com/oysterprotocol/brokernode/models"
	"github.com/oysterprotocol/brokernode/services"
)

func init() {
}

func VerifyDataMaps(IotaWrapper services.IotaService) {

	unverifiedDataMaps := []models.DataMap{}

	err := models.DB.Where("status = ?", models.Unverified).All(&unverifiedDataMaps)
	if err != nil {
		raven.CaptureError(err, nil)
	}

	if len(unverifiedDataMaps) > 0 {
		for i := 0; i < len(unverifiedDataMaps); i += BundleSize {
			end := i + BundleSize

			if end > len(unverifiedDataMaps) {
				end = len(unverifiedDataMaps)
			}

			CheckChunks(IotaWrapper, unverifiedDataMaps[i:end])
		}
	}
}

func CheckChunks(IotaWrapper services.IotaService, unverifiedDataMaps []models.DataMap) {

	filteredChunks, err := IotaWrapper.VerifyChunkMessagesMatchRecord(unverifiedDataMaps)

	if err != nil {
		raven.CaptureError(err, nil)
	}

	if len(filteredChunks.MatchesTangle) > 0 {

		for _, matchingChunk := range filteredChunks.MatchesTangle {
			//go services.SegmentClient.Enqueue(analytics.Track{
			//	Event:  "chunk_matched_tangle",
			//	UserId: services.GetLocalIP(),
			//	Properties: analytics.NewProperties().
			//		Set("address", matchingChunk.Address).
			//		Set("genesis_hash", matchingChunk.GenesisHash).
			//		Set("chunk_idx", matchingChunk.ChunkIdx),
			//})

			matchingChunk.Status = models.Complete
			models.DB.ValidateAndSave(&matchingChunk)
		}
	}

	if len(filteredChunks.DoesNotMatchTangle) > 0 {

		// when we bring back hooknodes, decrement their reputation here

		for _, notMatchingChunk := range filteredChunks.DoesNotMatchTangle {
			//go services.SegmentClient.Enqueue(analytics.Track{
			//	Event:  "resend_chunk_tangle_mismatch",
			//	UserId: services.GetLocalIP(),
			//	Properties: analytics.NewProperties().
			//		Set("address", notMatchingChunk.Address).
			//		Set("genesis_hash", notMatchingChunk.GenesisHash).
			//		Set("chunk_idx", notMatchingChunk.ChunkIdx),
			//})

			// if a chunk did not match the tangle in verify_data_maps
			// we mark it as "Error" and there is no reason to check the tangle
			// for it again while its status is still in an Error state

			// this is to prevent verifyChunkMessageMatchesTangle
			// from being executed on an Error'd chunk in process_unassigned_chunks
			notMatchingChunk.Status = models.Error
			notMatchingChunk.TrunkTx = ""
			notMatchingChunk.BranchTx = ""
			notMatchingChunk.NodeID = ""
			models.DB.ValidateAndSave(&notMatchingChunk)
		}
	}
}
